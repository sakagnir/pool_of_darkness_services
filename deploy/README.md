# Machine cible `vm-prod` — Pool of Darkness

> **Document de production** : ce que fait la machine cible, comment la (re)monter, comment s'y connecter et vérifier qu'elle va bien.
> **Palier 1 / Phase 1 du J5** — doit fonctionner depuis **n'importe quel poste** de l'équipe (le « changement de main »).

---

## 1. C'est quoi `vm-prod` ?

La **mise en production maquettée** de la flotte : un conteneur qui embarque **un serveur SSH + son propre Docker** (`docker:dind`). Pour la pipeline, c'est une vraie machine : une adresse, un port, une clé, un utilisateur, un Docker au bout.

**Points clés**
- **Isolation** : le Docker de `vm-prod` ne voit pas les conteneurs de l'hôte (et réciproquement) → une panne « en prod » ne touche pas le dev.
- **Ports exposés** : `2222` SSH · `3000` app (front) · `9090` Prometheus · `3001` Grafana.
- **Persistance** : le volume `vm-prod-data` (`/var/lib/docker`) garde les conteneurs de la machine à travers les redémarrages.

---

## 2. Les fichiers du dossier

| Fichier | Rôle | À committer ? |
|---|---|---|
| `Dockerfile.vm` | construit la machine cible | ✅ oui |
| `*.pub` (une par membre) | **clés publiques** installées sur la machine (les « serrures ») | ✅ oui |
| ~~`deploy_key`~~ et toute clé **privée** (le « ticket ») | ne quitte jamais ton poste / les secrets | ❌ **jamais** |

> 🔑 **Pas de mot de passe** : l'accès SSH se fait **uniquement par clé**. Le `Dockerfile.vm` installe **toutes** les `*.pub` du dossier : chaque membre de l'équipe a **sa propre paire**, et sa clé publique est ajoutée ici. La clé privée reste chez chacun (et dans les secrets GitHub pour la pipeline).

### Ajouter la clé d'un nouveau membre
```bash
# 1. Chaque membre génère sa paire (une fois), avec sa propre phrase :
ssh-keygen -t ed25519 -C "<nom>@pool-darkness" -f ~/.ssh/<nom>

# 2. Il donne sa clé PUBLIQUE, ex. ~/.ssh/<nom>.pub
# 3. On place cette clé ici, dans deploy/, sous un nom clair :
#    ex. deploy/alice.pub, deploy/boubacar.pub, deploy/camille.pub
#    (toutes les .pub du dossier seront installées au prochain build)
```

---

## 3. Construire & lancer

Depuis le dossier `deploy/` — le contexte de build doit contenir la clé publique (`COPY deploy_key.pub` à la racine du contexte) :

```bash
cd deploy

# 1. Construire
docker build -f Dockerfile.vm -t vm-prod .

# 2. Lancer (SSH :2222, app :3000, Prometheus :9090, Grafana :3001)
docker run -d --privileged \
  --name vm-prod \
  -p 2222:22 -p 3000:3000 -p 9090:9090 -p 3001:3001 \
  -v vm-prod-data:/var/lib/docker \
  vm-prod
```

> ⚠️ Premier lancement seulement. Ensuite, un conteneur existant se **redémarre** (section 4), il ne se relance pas avec `docker run`.

---

## 4. Vérifier / redémarrer

```bash
# Le conteneur tourne ?
docker ps --filter name=vm-prod        # doit être « Up »

# Le Docker de la machine répond en SSH ? (utilise SA clé privée)
ssh -i ~/.ssh/<nom> -p 2222 root@localhost 'docker ps'

# Redémarrer une machine arrêtée (pas de docker run !)
docker start vm-prod
ssh -i ~/.ssh/<nom> -p 2222 root@localhost 'docker ps'
```

> ⚠️ **Chemin de la clé** : remplace `~/.ssh/<nom>` par **ta** clé privée, celle dont la publique est installée dans `deploy/`. Droits stricts obligatoires : `chmod 600 ~/.ssh/<nom>`.

---

## 5. Dépannage SSH

| Symptôme | Cause probable | Manœuvre |
|---|---|---|
| `Permission denied (publickey)` | mauvaise clé passée avec `-i`, ou clé privée absente/autre | pointer `-i` vers la bonne clé privée |
| clé refusée / trop permissive | SSH refuse les clés accessibles aux autres | `chmod 600 <chemin>` |
| `Connection refused` | conteneur pas `Up`, ou port 2222 non exposé | `docker ps --filter name=vm-prod` doit être « Up » |
| `No such file or directory` (identity file) | le chemin `-i` ne pointe vers rien | vérifier le chemin de la clé privée |
| invite `password:` | SSH n'a pas trouvé la clé → retombe en mot de passe (qui n'existe pas) | fournir la bonne clé avec `-i` |
| `no route to host` (docker pull interne) | DNS cassé dans le conteneur | relancer avec `--dns 8.8.8.8 --dns 1.1.1.1` |
| 1ʳᵉ connexion → valider l'empreinte | host key inconnue (normal) | accepter, ou `-o StrictHostKeyChecking=no` |

---

## 6. Gotchas (leçons de J3)

- **Recréer `vm-prod` perd `/srv/*`** : seul `/var/lib/docker` est dans le volume. `.env` et les fichiers envoyés sur la machine (compose, etc.) doivent être **re-déployés** après un recreate.
- **DNS** : peut casser dans le conteneur → la parade `--dns 8.8.8.8 --dns 1.1.1.1`.
- **Clé privée jamais dans le repo** : un `git log -p` qui la montre = fuite. Elle va dans les **secrets GitHub** pour la pipeline.

---

## 7. Vers le palier 2 (déploiement de la flotte)

`vm-prod` est la **machine cible** de la pipeline de déploiement :
- le workflow envoie la description de la flotte (compose) + le `.env` sur la machine (généralement `/srv/flotte` ou équivalent) ;
- puis `docker compose pull && docker compose up -d` en SSH remplace la flotte entière ;
- la vérification interroge les routes de santé des services exposés.

> **Rôles** : « Livraison » possède workflow + machine cible ; « État » s'occupe des volumes (`vm-prod-data`, `/srv/*`, pavillon) ; chaque membre doit savoir **remonter** `vm-prod` seul.
