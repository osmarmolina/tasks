import express from "express";
//Se importa el puerto de la Api desde el archivo de configuraciones
import { config } from "./config.js";
//Modulo de rutas de express
import { routes } from "./routes/index.js";
//Modulo para conexion a MySql
import mysql2 from "mysql2";

const app = express();

//Funcion de express para poder procesar peticiones de tipo json
app.use(express.json());
app.use((err, req, res, next) => {
  console.log(err);
  return res.status(400).send({ error: true, message: `${err.message}` });
});
//Ruteo
app.use("/user", routes.user);
app.use("/tasks", routes.tasks);
//Se inicaliza el servidor
app.listen(config.PORT, () => {
  console.log(`=> Server listen on port: ${config.PORT}`);
});

//Inicializacion de conexion a base de datos
const con = mysql2.createConnection({
  host: config.HOST,
  database: config.DATABASE,
  port: config.DBPORT,
  user: config.USER,
  password: config.DBPASSWORD,
});

con.connect(function (error) {
  if (error) {
    console.log(` DB connection failed, error: ${error.message}`);
  } else {
    console.log("==> Succesfull conection db");
  }
});

export const connection = con.promise();
