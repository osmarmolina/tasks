## Initialization

## Install packages

At the root of the proyect execute the following command:

```
npm i
```

# Database

The file: /db/task.sql contains the query to create the database

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

Go to wiki: https://github.com/osmarmolina/tasks/wiki to see the details of each endpoints

## Login/SignIn

1. The firs step is to create a user to access the system
2. When created user you will be able to login in to be able to obtain an access token and use the endpoint 🚀️

## Logs

All process performed in the api is recorder inside the logs folder, the name of the file will depends of the day, a log file is created per day.
