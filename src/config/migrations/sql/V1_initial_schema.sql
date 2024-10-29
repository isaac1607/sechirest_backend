-- V1__initial_schema.sql

-- Configuration des types d'abonnement
CREATE TABLE configuration_abonnement (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(255) UNIQUE NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuration des villes
CREATE TABLE configuration_ville (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(255) UNIQUE NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuration des communes
CREATE TABLE configuration_commune (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(255) UNIQUE NOT NULL,
    ville_id INTEGER NOT NULL REFERENCES configuration_ville(id) ON DELETE RESTRICT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour la gestion des OTP
CREATE TABLE configuration_otp (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table principale des restaurants
CREATE TABLE restaurant_restaurant (
    id SERIAL PRIMARY KEY,
    identifiant VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    autre_contact VARCHAR(255),
    description TEXT,
    first_create BOOLEAN DEFAULT TRUE,
    actif BOOLEAN DEFAULT TRUE,
    abonne BOOLEAN DEFAULT FALSE,
    type_abonnement_id INTEGER REFERENCES configuration_abonnement(id) ON DELETE SET NULL,
    fin_abonnement DATE,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des jetons d'authentification
CREATE TABLE restaurant_jeton (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifiant VARCHAR(255) UNIQUE NOT NULL,
    restaurant_id INTEGER NOT NULL REFERENCES restaurant_restaurant(id) ON DELETE CASCADE,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des sites de restaurant
CREATE TABLE restaurant_site (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    siege BOOLEAN DEFAULT FALSE,
    code_access TEXT NOT NULL,
    ville_id INTEGER NOT NULL REFERENCES configuration_ville(id) ON DELETE RESTRICT,
    commune_id INTEGER NOT NULL REFERENCES configuration_commune(id) ON DELETE RESTRICT,
    quartier VARCHAR(255) NOT NULL,
    longitude VARCHAR(255),
    latitude VARCHAR(255),
    api_key VARCHAR(255),
    vector_store_id VARCHAR(255),
    deleted BOOLEAN DEFAULT FALSE,
    restaurant_id INTEGER NOT NULL REFERENCES restaurant_restaurant(id) ON DELETE CASCADE,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des types de menu
CREATE TABLE menu_type (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    site_id INTEGER NOT NULL REFERENCES restaurant_site(id) ON DELETE RESTRICT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurant_restaurant(id) ON DELETE RESTRICT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories de menu
CREATE TABLE menu_categorie (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    menu_type_id INTEGER NOT NULL REFERENCES menu_type(id) ON DELETE CASCADE,
    site_id INTEGER NOT NULL REFERENCES restaurant_site(id) ON DELETE RESTRICT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurant_restaurant(id) ON DELETE CASCADE,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des plats
CREATE TABLE menu_plat (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    prix INTEGER NOT NULL,
    always_available BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    menu_type_id INTEGER NOT NULL REFERENCES menu_type(id) ON DELETE CASCADE,
    menu_categorie_id INTEGER NOT NULL REFERENCES menu_categorie(id) ON DELETE CASCADE,
    site_id INTEGER NOT NULL REFERENCES restaurant_site(id) ON DELETE RESTRICT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurant_restaurant(id) ON DELETE CASCADE,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour mettre à jour automatiquement update_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à toutes les tables
CREATE TRIGGER update_configuration_abonnement_updated_at BEFORE UPDATE ON configuration_abonnement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuration_ville_updated_at BEFORE UPDATE ON configuration_ville FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuration_commune_updated_at BEFORE UPDATE ON configuration_commune FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuration_otp_updated_at BEFORE UPDATE ON configuration_otp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_restaurant_updated_at BEFORE UPDATE ON restaurant_restaurant FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_jeton_updated_at BEFORE UPDATE ON restaurant_jeton FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_site_updated_at BEFORE UPDATE ON restaurant_site FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_type_updated_at BEFORE UPDATE ON menu_type FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_categorie_updated_at BEFORE UPDATE ON menu_categorie FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_plat_updated_at BEFORE UPDATE ON menu_plat FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();