/*
Archivo que contiene todas las funciones de autentificacion como de encriptacion de contraseñas 
para ser guardadas en base de datos de manera mas segura
*/

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//Este secret se obtiene de el archivo de configuraciones y es necesario para poder firmar los tokens
import { secret } from "../config.js";

//Se una la funcion hash de la libreria bcrypt para generar una encriptacion de un parametro en este caso data es la contraseña
export async function encryptPassword(data) {
  const hashData = bcrypt.hash(data, 10);
  return hashData;
}

//Se utiliza la funcion compaare de bcrypt para compara la contrase3ña encriptada y la contraseña sin encriptar para saber si es correvta la contraseña
export async function validatePassword(hashedData, data) {
  const match = await bcrypt.compare(data, hashedData);
  return match;
}

//Por medio de la libreria jwt se genera un token de acceso con los parametros descritos en la funcion asi como un tiempo de expiracion de 1 dia
export function createToken(data) {
  const accesToken = jwt.sign(
    {
      name: data.name ?? undefined,
      username: data.username,
      user_id: data.user_id,
      lastname: data.lastname,
    },
    secret,
    { expiresIn: "24h" },
    { algorithm: "RS512" }
  );
  return accesToken;
}

//Se valida el token para poder dar acceso
export async function validateToken(token, secret) {
  const coded = jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      return { error: true, message: error.message };
    }
    return { error: false, results: decoded };
  });
  return coded;
}
