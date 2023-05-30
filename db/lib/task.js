//Se importa laconexion desde el archivo de configuracion
import { connection } from "../../api/server.js";

//La clase Task contendra los metodos para poder hacer el CRUD, estos metodos hacen la ejecucion de la query de sql
class Task {
  constructor() {}

  //Metodo que se usara para filtrar tasks
  getTasks(data) {
    //Array donde se van a colocar los filtros dependiendo de las necesidades
    let filter = [];
    let begin = "";

    //Paginacion
    if (data.page !== undefined && data.num_reg !== undefined) begin = (parseInt(data.page) - 1) * parseInt(data.num_reg);
    //Validacion de cada filtro para hacer push de el en el array
    if (data.status !== undefined) filter.push(`a.status = ${data.status}`);
    if (data.task_id) filter.push(`a.task_id = '${data.task_id}'`);
    if (data.title) filter.push(`a.title LIKE '%${data.title}%'`);
    if (data.created_by) filter.push(`b.user_id = ${data.created_by}`);
    if (data.user_in_charge) filter.push(`c.user_in_charge = ${data.user_in_charge} `);
    if (data.is_public !== undefined) filter.push(`a.is_public = ${data.is_public} `);

    //Se añade el filtro por default is_public en true para ver solo las tareas publicas
    //filter.push("a.is_public = true");

    const query = `SELECT a.id, a.title, a.description, a.task_id, a.status, a.is_public, a.tags, b.user_id as created_user_id, b.name AS created_by_name,
                    c.user_id AS id_user_in_charge, c.name AS name_user_in_charge  
                    FROM task a 
                    INNER JOIN user b ON a.created_by = b.id
                    LEFT JOIN user c ON a.user_in_charge = c.id
                    ${filter.length !== 0 ? ` WHERE ${filter.join(" AND ")}` : ""}
                    ${data.num_reg ? `LIMIT ${data.num_reg}` : ""} ${begin !== "" ? `OFFSET ${begin}` : ""}`;

    const result = connection.query(query);
    return result;
  }
  //Este metodo recibe el title el cual no debe ser vacio y el parametro description que es opcional
  createTask(data) {
    console.log(data)
    const query = `INSERT INTO task(title, task_id, description, is_public, tags, file, created_by, user_in_charge) 
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = connection.query(query, [
      data.title,
      data.task_id,
      data.description ?? "",
      data.is_public,
      data.tags ? JSON.stringify(data.tags) : {},
      data.file ?? null,
      data.created_by,
      data.user_in_charge ?? null,
    ]);
    console.log(query);

    return result;
  }

  updateTask(data) {
    const filter = [];
    if (data.description) filter.push(`description = '${data.description}'`);
    if (data.title) filter.push(`title = '${data.title}'`);
    if (data.status !== undefined) filter.push(`status = ${data.status}`);
    if (data.user_in_charge) filter.push(`user_in_charge = ${data.user_in_charge}`);
    if (data.is_public !== undefined) filter.push(`is_public = ${data.is_public}`);
    filter.join(" , ");

    const query = `UPDATE task SET ${filter.length !== 0 ? `${filter.join(" , ")} WHERE task_id = '${data.task_id}'` : ""}`;
    console.log(query);
    const result = connection.query(query);
    return result;
  }

  deleteTask(data) {
    const query = `DELETE FROM task WHERE id = ${data.task_id}`;
    const result = connection.query(query);
    return result;
  }
}
export default Task;
