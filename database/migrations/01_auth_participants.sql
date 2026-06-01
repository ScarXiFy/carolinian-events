-- 01_auth_participants.sql

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('Student', 'Organizer', 'Admin') DEFAULT 'Student',
    github_id VARCHAR(255) UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_participants (
    event_id INT(11) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_images (
    id INT(11) NOT NULL AUTO_INCREMENT,
    event_id INT(11) NOT NULL,
    image_url VARCHAR(1024) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY event_images_event_sort (event_id, sort_order, id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT(11) NOT NULL AUTO_INCREMENT,
    recipient_user_id VARCHAR(255) NOT NULL,
    type VARCHAR(80) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    event_id INT(11) DEFAULT NULL,
    actor_user_id VARCHAR(255) DEFAULT NULL,
    read_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY notifications_recipient_read_created (recipient_user_id, read_at, created_at),
    KEY notifications_event_type (event_id, type),
    FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS organizer_requests (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by_user_id VARCHAR(255) DEFAULT NULL,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY organizer_pending_user_status (user_id, status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
    rate_key VARCHAR(255) NOT NULL,
    count INT NOT NULL DEFAULT 0,
    reset_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (rate_key),
    KEY rate_limits_reset_at (reset_at)
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS participant_limit INT DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_image_path VARCHAR(255) DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by_user_id VARCHAR(255) DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255) DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(32) DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS approval_status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Approved';
ALTER TABLE events ADD COLUMN IF NOT EXISTS approved_by_user_id VARCHAR(255) DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS rejected_by_user_id VARCHAR(255) DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL DEFAULT NULL;
UPDATE events SET approval_status = 'Approved' WHERE approval_status IS NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE users MODIFY COLUMN role ENUM('Student', 'Organizer', 'Admin') DEFAULT 'Student';
UPDATE users SET email_verified_at = CURRENT_TIMESTAMP WHERE email_verified_at IS NULL;
