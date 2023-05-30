## Initialization

## Install packages

At the root of the proyect execute the following command:

```
npm i
```

# Database

The file: /db/task.sql contains the query to create the database of execute the following query:

```sql
CREATE DATABASE task;
USE task;

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
    user_id INT NOT NULL,
    user_in_charge INT,
    file MEDIUMBLOB,
    created_by INT NOT NULL,
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
```

## File config

The file config /api/config.js contains the parameters to the api and the connection to the database:

```js
export const secret = "mysecret123"; //Secret word to sign the token
export const config = {
PORT: 3000, //Api port, use the port you need
HOST: "localhost", //Host database
DATABASE: "task", //Name of the databe
DBPORT: 3306, //Database port
USER: "root", //User database
DBPASSWORD: "3091", //Password database
};
```

## Start api 🚀️

Run the following script to start api:

```
npm run dev
```

## Endpoints

Go go wiki [github.com/osmarmolina/tasks/wiki](https://) to see the details of each endpoints

## Login/SignIn

1. The firs step is to create a user to access the system
2. When created user you will be able to login in to be able to obtain an access token and use the endpoint 🚀️

## Logs

All process performed in the api is recorder inside the logs folder, the name of the file will depends of the day, a log file is created per day.
