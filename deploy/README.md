# Machine cible `vm-prod` — Pool of Darkness

> **Palier 1 / Phase 1** du J5 : avoir une machine de production (maquette) qui répond, et un repo où toute l'équipe peut pousser.

## Qu'est-ce que `vm-prod` ?

Une **maquette de serveur de production** : un conteneur qui embarque **un serveur SSH + son propre Docker** (`docker:dind`). Du point de vue de la pipeline, c'est une vraie machine : une adresse, un port, une clé, un utilisateur, un Docker de l'autre côté.

**Isolation clé** : le Docker de `vm-prod` ne voit **pas** les conteneurs de l'hôte (et réciproquement). Une panne en « production » ne touche jamais le dev.

## Fichiers dans ce dossier

| Fichier | Rôle | À committer ? |
|---|---|---|
| `Dockerfile.vm` | construit la machine cible | ✅ oui |
| `deploy_key.pub` | **clé publique** autorisée à entrer | ✅ oui |
| ~~`deploy_key`~~ | clé **privée** — ne quitte jamais le poste/pipeline | ❌ **jamais** (ignorée par `.gitignore`) |

> ⚙️ La clé privée `deploy_key` vit sur le poste du membre « Livraison » (et dans les **secrets** du repo GitHub pour la pipeline). Elle n'est **jamais** commitée.

## Construire & lancer `vm-prod`

Depuis la racine du repo de groupe :

```bash
# 1. Construire l'image de la machine cible
docker build -f deploy/Dockerfile.vm -t vm-prod .

# 2. La lancer (SSH :2222, app :3000, Prometheus :9090, Grafana :3001)
docker run -d --privileged \
  --name vm-prod \
  -p 2222:22 -p 3000:3000 -p 9090:9090 -p 3001:3001 \
  -v vm-prod-data:/var/lib/docker \
  vm-prod

# 3. Vérifier qu'elle répond (docker interne vivant)
ssh -i deploy/deploy_key -p 2222 root@localhost 'docker ps'
```

> ⚠️ **gotchas de J3** :
> - le DNS du conteneur peut casser → relancer avec `--dns 8.8.8.8 --dns 1.1.1.1` si `docker pull` échoue avec « no route to host » ;
> - recréer `vm-prod` perd `/srv/todo` (seul `/var/lib/docker` est dans le volume) → `.env` et compose doivent être re-envoyés après un recreate.

## Redémarrer si elle était arrêtée

```bash
docker start vm-prod
ssh -i deploy/deploy_key -p 2222 root@localhost 'docker ps'
```

## À noter pour l'équipe
- La **machine change de main** au moins une fois : chacun doit savoir la remonter (procédure de J3).
- Le numéro de port d'**état** : c'est ici que la flotte (front/api/annexe/base) sera déployée au palier 2.
