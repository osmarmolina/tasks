import { dbControllers } from "../../db/index.js";
import joi from "joi";
import { v4 as uuid } from "uuid";
import { logger } from "../lib/logs.js";

//Validacion por medio de joi para aceptar solo los tipos y datos necesarios
const createTaskSchema = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
  is_public: joi.boolean().required(),
  user_in_charge: joi.string(),
  tags: joi.array(),
});

const searchTaskSchema = joi.object({
  title: joi.string(),
  user_in_charge: joi.string(),
  created_by: joi.string(),
  tags: joi.array(),
  num_reg: joi.number().required(),
  page: joi.number().required(),
});

const updateTaskSchema = joi.object({
  title: joi.string(),
  user_in_charge: joi.string(),
  tags: joi.array(),
  is_public: joi.boolean(),
  status: joi.boolean(),
  task_id: joi.string().required(),
  description: joi.string(),
  shared_by_users: joi.array(),
});

export const searchTasks = async (req, res, next) => {
  try {
    const { body } = req;
    const validate = searchTaskSchema.validate(body);
    if (validate.error) {
      logger.error(`/task, controlador: searchTasks, El usuario ${req.headers.username} intento hacer una busqueda de tareas no valida, data: ${JSON.stringify(body)} `);
      return res.status(400).json({ error: true, message: validate.error.message });
    }

    //Si el usuario es admin podra ver todas las tareas y en caso de ser user solo puede ver las tareas publicas
    req.headers.rol === "admin" ? "" : (body.is_public = true);

    const dataTotalReg = { ...body };
    delete dataTotalReg.num_reg;
    delete dataTotalReg.page;

    const totalReg = await dbControllers.task.getTasks(dataTotalReg);
    const findTask = await dbControllers.task.getTasks(body);
    const finalDataTask = [];

    for (let task of findTask[0]) {
      const userrsShare = await dbControllers.userTask.getUserTask({ task_id: task.id });
      if (userrsShare[0].length === 0) task.share_with_users = [];
      task.share_with_users = userrsShare[0];
      finalDataTask.push(task);
      delete task.id;
    }

    logger.info(`/task, controlador: searchTasks, El usuario ${req.headers.username} solicito tareas, data: ${JSON.stringify(body)} `);

    return res.status(200).json({
      error: false,
      results: finalDataTask,
      total_reg: totalReg[0].length,
      num_reg: body.num_reg,
      page: body.page,
    });
  } catch (error) {
    return next(error);
  }
};

export const createTasks = async (req, res, next) => {
  try {
    const { body } = req;
    const validate = createTaskSchema.validate(body);
    if (validate.error) {
      return res.status(400).json({ error: true, message: validate.error.message });
    }

    const existTask = await dbControllers.task.getTasks({
      title: body.title.trim(),
    });

    if (existTask[0].length !== 0) {
      logger.error(`/task, controlador: createTasks, El usuario ${req.headers.username} Intento crear una nueva tarea pero el title ya esta en uso, data: ${JSON.stringify(body)}`);
      return res.status(400).json({ error: true, message: "The task is already in use" });
    }

    const taskId = "tsk_" + uuid().substring(22);
    const userId = req.headers.userId;

    const dataTask = {
      title: body.title.trim(),
      description: body.description.trim(),
      is_public: body.is_public,
      tags: body.tags ?? [],
      task_id: taskId,
      created_by: userId,
      file: body.file,
    };

    if (body.user_in_charge) {
      const userInCharge = await dbControllers.user.getUser({ user_id: body.user_in_charge });
      if (userInCharge[0].length !== 1) {
        logger.error(`/task, controlador: createTasks, El usuario ${req.headers.username} Intento crear una nueva tarea pero no se encontro el usuario a cargo, data: ${JSON.stringify(body)}`);
        return res.status(400).json({ error: true, message: "User in charge not found" });
      }
      dataTask.user_in_charge = userInCharge[0][0].id;
    }

    const creatTask = await dbControllers.task.createTask(dataTask);
    if (creatTask[0].affectedRows !== 1) {
      logger.error(`/task, controlador: createTasks, El usuario ${req.headers.username} Intento crear una nueva tarea pero hubo un error desconocido, data: ${JSON.stringify(body)}`);
      return res.status(400).json({ error: true, message: "Error to create task" });
    }

    const createdTask = await dbControllers.task.getTasks({ task_id: taskId });
    logger.info(`/task, controlador: createTasks, El usuario ${req.headers.username} El usuario ${req.headers.username} creo una nueva tarea, data: ${JSON.stringify(body)}`);

    return res.status(200).json({ error: false, results: createdTask[0] });
  } catch (error) {
    return next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { body } = req;
    const validate = updateTaskSchema.validate(body);
    if (validate.error) {
      logger.error(`/task, controlador: updateTask, usuario: ${req.headers.username}, Intento de actualizar una nueva tarea con datos invalidos, data: ${JSON.stringify(body)}`);
      return res.status(400).json({ error: true, message: validate.error.message });
    }

    const searchedTask = await dbControllers.task.getTasks({ task_id: body.task_id });
    if (searchedTask[0].length !== 1) {
      logger.error(`/task, controlador: updateTask, usuario ${req.headers.username}, No se encontro la tarea, data: ${JSON.stringify(body)}`);
      return res.status(400).json({ error: true, message: "Task not found" });
    }

    const userId = req.headers.userId;
    //const user_in_chargue_id = searchedTask[0][0].user_in_charge;
    const userShareTask = await dbControllers.userTask.getUserTask({ user_id: userId, task_id: searchedTask[0][0].id });

    if (body.title) {
      const titleTask = await dbControllers.task.getTasks({ title: body.title });
      if (titleTask[0].length !== 0) {
        logger.error(`/task, controlador: updateTask, usuario ${req.headers.username}, No se actualizo la tarea por que el title ya existente, data: ${JSON.stringify(body)}`);
        return res.status(200).json({ error: true, message: "The title is already in use" });
      }
    }

    if (body.shared_by_users) {
      const users = [];
      for (let user of body.shared_by_users) {
        const dataUser = await dbControllers.user.getUser({ user_id: user });
        if (dataUser[0].length !== 1) {
          logger.error(`/task, controlador: updateTask, usuario: ${req.headers.username}, No se actualizo la tarea ya que no se encontro el id de usuario: ${user}, data: ${JSON.stringify(body)}`);
          return res.status(400).json({ error: true, message: `The user with id ${user} not found` });
        }
        const userTask = await dbControllers.userTask.getUserTask({ user_id: dataUser[0][0].id, task_id: searchedTask[0][0].id });
        if (userTask[0].length === 0) {
          users.push(dataUser[0][0].id);
        }
      }
      if (users.length > 0) {
        for (let user of users) {
          await dbControllers.userTask.createUserTask({ user_id: user, task_id: searchedTask[0][0].id });
        }
      }
    }

    if (req.headers.user_id === searchedTask[0][0].created_user_id || req.headers.user_id === searchedTask[0][0].id_user_in_charge || req.headers.rol === "admin" || userShareTask[0].length === 1) {
      if (body.user_in_charge) {
        const newUserInCharge = await dbControllers.user.getUser({ user_id: body.user_in_chargue });
        if (newUserInCharge[0].length !== 1) return res.status(400).json({ error: true, message: "user in chargue not found" });
        body.user_in_chargue = newUserInCharge[0][0].id;
      }
      await dbControllers.task.updateTask(body);
      logger.info(`/task, controlador: updateTask, El usuario ${req.headers.username}, Se actualizo correctamente la tarea, data: ${JSON.stringify(body)}`);

      return res.status(200).json({ error: false, results: [body] });
    } else {
      return res.status(403).json({ error: true, message: "Dennied action" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user_id = req.params.userId;

    if (!id) return res.status(400).json({ error: true, message: "Id task not provided" });
    const dataTask = await dbControllers.task.getTasks({ task_id: id });

    if (dataTask[0].length !== 1) {
      logger.error(`/task, controlador: deleteTask, usuario: ${req.headers.username} Intento actualizar una tarea que no existe, data: ${id}`);
      return res.status(400).json({ error: true, message: "Task not found" });
    }

    const userShareTask = await dbControllers.userTask.getUserTask({ user_id: user_id, task_id: dataTask[0][0].id });
    if (req.headers.user_id === dataTask[0][0].created_user_id || req.headers.user_id === dataTask[0][0].id_user_in_charge || req.headers.rol === "admin" || userShareTask[0].length === 1) {
      const deleteUserTask = await dbControllers.userTask.deleteUserTask({ task_id: dataTask[0][0].id });

      await dbControllers.task.deleteTask({ task_id: dataTask[0][0].id });

      logger.error(`/task, controlador: deleteTask, usuario: ${req.headers.username}, Se elimino la tarea ${dataTask[0]}`);
      return res.status(200).json({ error: false, results: dataTask[0] });
    } else {
      logger.error(`/task, controlador: deleteTask, usuario: ${req.headers.username}, El usuario no tiene permisos para borrar tareas, data: ${id}`);
      return res.status(403).json({ error: true, message: "Dennied action" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
