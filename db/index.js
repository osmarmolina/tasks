//Se importa el controlador task con los metodos CRUD
import Task from "../db/lib/task.js";
import User from "../db/lib/user.js";
import UserTask from "../db/lib/user-task.js";

//Se inicializa la clase Task para poder asignar sus metodos ala constante task y ser ecportadfa en el controllador general
const task = new Task();
const user = new User();
const userTask = new UserTask();

//Modulo que contendra todos lo controlladores para las futuras entidades que se agregen en la carpeta lib
export const dbControllers = {
  task,
  user,
  userTask
};
