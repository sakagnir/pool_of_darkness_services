-- init.sql — schéma initial de la flotte Pool of Darkness
-- Monté dans /docker-entrypoint-initdb.d/ : exécuté au PREMIER démarrage de la base.

-- La file karaoké : les inscriptions en attente / passées
CREATE TABLE IF NOT EXISTS file_karaoke (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nom        VARCHAR(50)  NOT NULL,
  chanson    VARCHAR(100) NOT NULL,
  artiste    VARCHAR(100) NOT NULL,
  statut     VARCHAR(20)  NOT NULL DEFAULT 'EN_ATTENTE',
  position   INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- L'historique des passages (utilisé par les tests)
CREATE TABLE IF NOT EXISTS historique_passages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(50)  NOT NULL,
  chanson     VARCHAR(100) NOT NULL,
  artiste     VARCHAR(100) NOT NULL,
  passe_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
