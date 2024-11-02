-- V2__add_assistant.sql
-- Table restaurant assistant AI
CREATE TABLE restaurant_assistant (
    id SERIAL PRIMARY KEY,
    nom_site TEXT,
    fichier_menu TEXT,
    rate_of_speech FLOAT DEFAULT 1.1,
    wait_of_speech FLOAT DEFAULT 2,
    max_stand_by INTEGER DEFAULT 2,
    sleep FLOAT DEFAULT 0.2,
    wait_for_api_response FLOAT DEFAULT 5,
    nb_last_message INTEGER DEFAULT 7,
    deep INTEGER DEFAULT 3,
    silence_threshold INTEGER DEFAULT 800,
    rms_noise_threshold FLOAT DEFAULT 0.08,
    voice_api TEXT DEFAULT '11L',
    instruction TEXT,
    deleted BOOLEAN DEFAULT FALSE,
    site_id INTEGER NOT NULL REFERENCES restaurant_site(id) ON DELETE RESTRICT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurant_restaurant(id) ON DELETE CASCADE,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajout d'un trigger pour mettre à jour automatiquement update_at
CREATE OR REPLACE FUNCTION update_restaurant_assistant_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurant_assistant_timestamp
    BEFORE UPDATE ON restaurant_assistant
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_assistant_timestamp();