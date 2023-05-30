//Se importa laconexion desde el archivo de configuracion
import { connection } from "../../api/server.js";

//La clase User contendra los metodos para poder hacer el CRUD, estos metodos hacen la ejecucion de la query de sql
class User {
  constructor() {}

  getUser(data) {
    let filter = [];

    if (data.user_id) filter.push(`user_id = '${data.user_id}'`);
    if (data.username) filter.push(`username = '${data.username}' `);
    if (data.name) filter.push(`name = '${data.name}' `);

    const query = `SELECT * FROM user ${filter.length !== 0 ? ` WHERE ${filter.join(" AND ")}` : ""}`;
    const result = connection.query(query, [data.user_id]);
    return result;
  }

  //Metodo que registra un nuevo usuario
  createUser(data) {
    const query = `INSERT INTO user(name, lastname, username, user_id, password, rol ) 
                    VALUES(?, ?, ?, ?, ?, ?)`;
    const result = connection.query(query, [data.name, data.lastname, data.username, data.user_id, data.password, data.rol]);
    return result;
  }

  updateUser(data) {}
}
export default User;
