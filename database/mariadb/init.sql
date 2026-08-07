CREATE DATABASE IF NOT EXISTS karaoke;

USE karaoke;


-- ==========================================
-- TABLE PRINCIPALE : FILE DE KARAOKE
-- ==========================================

CREATE TABLE IF NOT EXISTS file_karaoke (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nom VARCHAR(100) NOT NULL,

    chanson VARCHAR(255) NOT NULL,

    artiste VARCHAR(255),

    statut ENUM(
        'EN_ATTENTE',
        'EN_COURS',
        'TERMINE',
        'PASSE'
    )
    NOT NULL DEFAULT 'EN_ATTENTE',


    -- ordre dans la file
    position INT NOT NULL,


    -- nombre de fois où la personne a été notifiée
    notifications INT DEFAULT 0,


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,


    INDEX idx_file_position(position),

    INDEX idx_file_statut(statut)
);



-- ==========================================
-- HISTORIQUE DES PASSAGES
-- ==========================================

CREATE TABLE IF NOT EXISTS historique_passages (

    id INT AUTO_INCREMENT PRIMARY KEY,

    participant_id INT NOT NULL,


    nom VARCHAR(100) NOT NULL,

    chanson VARCHAR(255) NOT NULL,

    artiste VARCHAR(255),


    date_passage TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_historique_participant
    FOREIGN KEY(participant_id)
    REFERENCES file_karaoke(id)
    ON DELETE CASCADE
);



-- ==========================================
-- CONFIGURATION DE LA SALLE
-- (utile pour service annexe)
-- ==========================================

CREATE TABLE IF NOT EXISTS configuration (

    id INT AUTO_INCREMENT PRIMARY KEY,

    cle VARCHAR(100) UNIQUE NOT NULL,

    valeur VARCHAR(255)

);



INSERT IGNORE INTO configuration
(cle,valeur)
VALUES
(
 'nombre_prochains_affiches',
 '3'
);



-- ==========================================
-- DONNEES DE TEST
-- ==========================================


INSERT INTO file_karaoke
(
    nom,
    chanson,
    artiste,
    position
)

VALUES

(
    'Alice',
    'Someone Like You',
    'Adele',
    1
),

(
    'Lucas',
    'Billie Jean',
    'Michael Jackson',
    2
),

(
    'Sarah',
    'Shallow',
    'Lady Gaga',
    3
),

(
    'Thomas',
    'Zombie',
    'The Cranberries',
    4
);