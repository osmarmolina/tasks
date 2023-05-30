import { v4 as uuid } from "uuid";
import joi from "joi";
import { dbControllers } from "../../db/index.js";
import { encryptPassword, validatePassword, createToken } from "../lib/auth.js";
import { logger } from "../lib/logs.js";
//Schema para validar los datos enviados por el front, en este caso se valida usuario y contraseña
const singSchema = joi.object({
  username: joi.string().required().alphanum(),
  password: joi.string().required(),
  lastname: joi.string(),
  name: joi
    .string()
    .required()
    .regex(/^[,. a-zA-Z]+$/)
    .label("Nmae only acept letters"),
  rol: joi.string().valid("user", "admin").required(),
});
const logInSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().required(),
});

const getSchemaSchema = joi.object({
  username: joi.string(),
  name: joi.string(),
  user_id: joi.string(),
});

export const signIn = async (req, res, next) => {
  try {
    const { body } = req;
    const validate = singSchema.validate(body);
    if (validate.error) {
      return res.status(400).json({ error: true, message: validate.error.message });
    }
    //Se encripta la contraseña para guardarla de manera mas segura en la base de datos
    const passwordHash = await encryptPassword(body.password);
    const userId = "usr_" + uuid().substring(22);
    const dataUser = {
      username: body.username.trim(),
      lastname: body.lastname?.trim() ?? "",
      password: passwordHash,
      name: body.name.trim(),
      user_id: userId,
      rol: body.rol,
    };
    const searchedUser = await dbControllers.user.getUser({ username: dataUser.username });
    if (searchedUser[0].length !== 0) {
      logger.error(`/user/sign-in, Ya existe el usuario: ${body.username}, data: ${JSON.stringify(dataUser)}'`);

      return res.status(400).json({ error: true, message: "The username already exist" });
    }

    await dbControllers.user.createUser(dataUser);

    logger.info(`/user/sign-in, Usuario registrado con exito, data: ${JSON.stringify(dataUser)}`);

    return res.status(200).json({ error: false, results: [{ username: body.username, name: body.name }] });
  } catch (error) {
    return next(error);
  }
};

export const logIn = async (req, res, next) => {
  try {
    const { body } = req;
    const validate = logInSchema.validate(body);
    if (validate.error) {
      logger.error(`/user/log-in, controlador: logIn, usuario: ${req.headers.username}, Datos enviados no validos, data: ${JSON.stringify(JSON.stringify(body))}`);

      return res.status(400).json({ error: true, message: validate.error.message });
    }

    const searchedUser = await dbControllers.user.getUser({ username: body.username.trim() });
    console.log(searchedUser[0]);

    if (searchedUser[0].length !== 1) {
      logger.error(`/user/log-in, No se encontro el usuario, data: ${JSON.stringify(JSON.stringify(body))}`);
      return res.status(400).json({ error: true, message: "wrong password or user" });
    }

    const matchPassword = await validatePassword(searchedUser[0][0].password, body.password);

    if (matchPassword === false) {
      logger.error(`/user/log-in, Contraseña invalida, data: ${JSON.stringify(body)}`);

      return res.status(400).json({ error: true, message: "wrong password or email" });
    }

    const token = createToken({
      username: searchedUser[0][0].username,
      user_id: searchedUser[0][0].user_id,
      name: searchedUser[0][0].name,
    });

    const responseAuth = {
      token: token,
      user_id: searchedUser[0][0].user_id,
      name: searchedUser[0][0].name,
      username: searchedUser[0][0].username,
    };

    logger.info(`/user/log-in, Login exitoso, data: ${JSON.stringify(body)}`);

    return res.status(200).json({ error: false, results: [responseAuth] });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { body } = req;
    const userRol = req.headers.rol;
    const username = req.headers.username;

    if (userRol !== "admin") {
      logger.error(`/user, controlador: getUsers, usuario: ${username}, No se tiene permisos para acceder a este recurso, data: ${JSON.stringify(body)}`);
      return res.status(403).json({ error: true, message: "Invalid permissions" });
    }

    const validate = getSchemaSchema.validate(body);
    if (validate.error) {
      logger.error(`/user, controlador: getUsers, usuario: ${username}, Datos enviados no validos, data: ${JSON.stringify(body)}`);
      return res.status(400).json({ error: true, message: validate.error.message });
    }

    const searchedUsers = await dbControllers.user.getUser(body);
    logger.info(`/user, controlador: getUsers, usuario: ${username}, Solicitus de usuarios, data: ${JSON.stringify(body)}`);

    return res.status(200).json({ error: false, results: searchedUsers[0] });
  } catch (error) {
    return next(error);
  }
};
