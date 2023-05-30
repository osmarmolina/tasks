CREATE DATABASE task;

CREATE TABLE user (
    id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (id),
    user_id VARCHAR(200) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    password VARCHAR(200),
    rol VARCHAR(100) NOT NULL,
    lastname VARCHAR(200),
    username VARCHAR(200) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task (
    id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (id),
    task_id VARCHAR(200) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL UNIQUE,
    description VARCHAR(200),
    status BOOLEAN NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT 0,
    tags JSON,
    file MEDIUMBLOB,
    created_by INT NOT NULL,
    user_in_charge INT,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (user_in_charge) REFERENCES user(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

create table user_task (
    user_id INT NOT NULL,
    task_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (task_id) REFERENCES task(id)
);