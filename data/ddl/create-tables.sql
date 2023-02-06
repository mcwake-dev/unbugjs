DROP TABLE IF EXISTS bug_audit;
DROP TABLE IF EXISTS bug;
DROP TABLE IF EXISTS app_version;
DROP TABLE IF EXISTS app;

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS app (
    app_id INT GENERATED ALWAYS AS IDENTITY,
    app_name citext UNIQUE,
    PRIMARY KEY(app_id)
);

CREATE TABLE IF NOT EXISTS app_version (
    app_version_id INT GENERATED ALWAYS AS IDENTITY,
    app_id INT,
    major_version smallint,
    minor_version smallint,
    patch_version smallint,
    PRIMARY KEY(app_version_id),
    UNIQUE(app_id, major_version, minor_version, patch_version),
    CONSTRAINT fk_app FOREIGN KEY(app_id) REFERENCES app(app_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bug (
    bug_id INT GENERATED ALWAYS AS IDENTITY,
    app_version_id INT,
    attempted TEXT,
    expected TEXT,
    actual TEXT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(bug_id),
    CONSTRAINT fk_app_version FOREIGN KEY(app_version_id) REFERENCES app_version(app_version_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bug_audit (
    bug_audit_id INT GENERATED ALWAYS AS IDENTITY,
    bug_id INT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    PRIMARY KEY(bug_audit_id),
    CONSTRAINT fk_bug FOREIGN KEY(bug_id) REFERENCES bug(bug_id) ON DELETE CASCADE
);

