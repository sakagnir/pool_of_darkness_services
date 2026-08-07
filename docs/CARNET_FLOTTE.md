# 📓 Carnet de la flotte — « Pool of Darkness »

> Journal de bord chiffré de la journée. Les mesures sont prises **avant/après**, jamais seulement après (règle J5 : un chiffre sans point de comparaison ne prouve rien).
> Équipage : **Pool of Darkness** · couleur `#000000` · pavillon « Mode sombre activé » · 3 carrés jurés.

---

## 1. Mesures de la flotte

### Taille de chaque image (avant optimisation)
| Service | Image | Taille |
|---|---|---|
| **api** (back) | `pool-karaoke-back` | **355 MB** |
| **front** | `pool-karaoke-front` | **259 MB** |
| **annexe** | `pool-karaoke-annexe` | **271 MB** |

> ⚠️ **À optimiser** : les 3 images sont en `node:alpine` sans multi-stage ni non-root. Cible : réduire significativement (bonne pratique J2 — multi-stage, `.dockerignore`, cache de build).

### Durée entre le push et le dernier carré à jour
| Moment | Mesure |
|---|---|
| Pouls individuel | ~2-5 s (cadence par défaut) |
| Carré visible au tableau après démarrage | < 10 s |
| Carré éteint quand on coupe le service | ~8 s |
| Rallumage après coupure réseau | auto (~quelques s) |

### Coups encaissés par pouls
| Config | Mesure |
|---|---|
| 1 exemplaire | à mesurer (route `/travail` en place) |
| 3 exemplaires (`--scale`) | à mesurer — attendu : **pas** 3× (goulot = base non dupliquée) |

### Point de bascule & saturation
| Mesure | Valeur |
|---|---|
| Nb de coups avant que le carré pâlisse | à mesurer (salve `POST /api/coups`) |
| Temps de retour à un carré plein après 1000 coups | à mesurer |

---

## 2. Journal de bord de la journée

### Incidents réels rencontrés (et corrigés)

| # | Ce qui s'est passé | Ce que le tableau montrait | Cause | Manœuvre |
|---|---|---|---|---|
| 1 | Backend ne démarrait pas | carré api absent | import `config/database.js` inexistant (équipe) | corrigé → `db/db.js` |
| 2 | `/travail` crash | — | destructuring mariadb `[rows]` (style MySQL2) | corrigé → `rows`/`result` |
| 3 | Inscription crash | — | BigInt non sérialisable (`insertId`) | corrigé → `Number()` |
| 4 | **0 carré vivant pendant le feu** | carrés `absent` (silence ~198 s) | `TABLEAU_URL` avec **slash final** → `//api/pulse` → tableau **redirige** | enlevé le slash final |
| 5 | Front mort (page sans données) | carré front plein mais page vide | `script.js` au lieu de `actions.js` + URL `locahost` en dur | corrigé → `actions.js` + `/config` |
| 6 | Front → API bloqué | — | **CORS** absent | middleware CORS ajouté |

### Leçon principale (panne 4 — la plus coûteuse)
> **Un `TABLEAU_URL` avec un slash final tue les carrés** : l'URL devient `//api/pulse`, le tableau répond `Redirecting...` (pas du JSON), le pouls échoue en silence. On l'a vu pendant l'ouverture du feu : carrés passés `absent` devant toute la classe.

### Adaptations au tableau réel
- Le tableau utilise **`/api/pulse`** (et `prochain_pulse_ms`), **pas** `/api/pouls` du cours → adapté dans les 3 pouls.
- Endpoint de l'état : `GET /api/etat` (utile pour le diagnostic).

---

## 3. Ce qu'il reste à mesurer (compléter en fin de journée)

- [ ] Saturation : salve `POST /api/coups` (200, 500, 1000) → point de bascule du carré pâle.
- [ ] Scale : `docker compose up -d --scale karaoke-back=3` → coups/pouls avant/après.
- [ ] Temps de retour à plein après 1000 coups.
- [ ] Optimisation images (multi-stage) → taille avant/après.
- [ ] Push→dernier carré à jour chronométré.
