-- Carolinian Events Management System
-- Clean MySQL schema snapshot for the Next.js migration.
-- Source reference: C:\xampp\htdocs\Carolinian-Events-Management-System\database\schema.sql

CREATE DATABASE IF NOT EXISTS carolinian_events_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE carolinian_events_db;

CREATE TABLE IF NOT EXISTS events (
    id          INT(11)      NOT NULL AUTO_INCREMENT,
    event_name  VARCHAR(255) NOT NULL,
    organizer   VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL,
    event_date  DATE         NOT NULL,
    event_time  TIME         NOT NULL,
    event_end_time TIME      NULL,
    location    VARCHAR(255) NOT NULL,
    category    ENUM('Academic', 'Cultural', 'Sports', 'Social', 'Other')
                             NOT NULL DEFAULT 'Academic',
    status      ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled')
                             NOT NULL DEFAULT 'Upcoming',
    participant_limit INT     DEFAULT NULL,
    event_image_path VARCHAR(255) DEFAULT NULL,
    created_by_user_id VARCHAR(255) DEFAULT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_participants (
    event_id INT(11) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO events
    (event_name, organizer, description, event_date, event_time, event_end_time, location, category, status, participant_limit, event_image_path, created_by_user_id)
VALUES
    (
        'Mock Presentation',
        'GROUP F',
        'A practice presentation session for CPE students to rehearse and refine their project demonstrations before the final defense.',
        '2026-05-05',
        '14:00:00',
        '16:00:00',
        'NCR Lab',
        'Academic',
        'Completed',
        80,
        NULL,
        NULL
    ),
    (
        'Proposal Hearing 2026',
        'CPE Department',
        'Annual thesis and capstone proposal hearing for 3rd year Computer Engineering students. Present your project proposals to the panel.',
        '2026-05-08',
        '15:30:00',
        '17:00:00',
        'Bunzel Building',
        'Academic',
        'Completed',
        120,
        NULL,
        NULL
    ),
    (
        'Carolinian Week 2026',
        'USC Student Council',
        'The annual week-long celebration of Carolinian culture featuring sports tournaments, talent shows, food fairs, and community outreach programs.',
        '2026-06-15',
        '08:00:00',
        '10:00:00',
        'USC Main Campus',
        'Cultural',
        'Upcoming',
        300,
        NULL,
        NULL
    ),
    (
        'Intramurals 2026',
        'USC Athletics',
        'University-wide intramural sports competition. Events include basketball, volleyball, badminton, table tennis, and track and field.',
        '2026-04-20',
        '07:30:00',
        '11:30:00',
        'USC Gymnasium',
        'Sports',
        'Completed',
        200,
        NULL,
        NULL
    ),
    (
        'Tech Talk: AI in Engineering',
        'CPE Society',
        'A guest lecture exploring the latest advancements in Artificial Intelligence and how they are reshaping Computer Engineering.',
        '2026-06-22',
        '13:00:00',
        '15:00:00',
        'Engineering Auditorium',
        'Academic',
        'Upcoming',
        100,
        NULL,
        NULL
    );
