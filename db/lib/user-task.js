import { connection } from "../../api/server.js";

class UserTask {
  constructor() {}

  getUserTask(data) {
    let filter = [];
    if (data.user_id) filter.push(`a.user_id = ${data.user_id}`);
    if (data.task_id) filter.push(`a.task_id = ${data.task_id} `);

    const query = `SELECT b.name, b.username, b.user_id FROM user_task a 
                    INNER JOIN user b ON a.user_id = b.id
                    ${filter.length !== 0 ? ` WHERE ${filter.join(" AND ")}` : ""}`;
    const result = connection.query(query);
    return result;
  }

  deleteUserTask(data) {
    let filter = [];

    if (data.user_id) filter.push(`user_id = ${data.user_id}`);
    if (data.task_id) filter.push(`task_id = ${data.task_id}`);

    const query = `DELETE FROM user_task  WHERE ${filter.join(" AND ")}`;
    const result = connection.query(query);
    return result;
  }

  createUserTask(data) {
    const query = `INSERT INTO user_task(user_id, task_id) VALUES(${data.user_id}, ${data.task_id})`;
    const result = connection.query(query);
    return result;
  }
}

export default UserTask;
