import { validateToken } from "../lib/auth.js";
import { dbControllers } from "../../db/index.js";
import { secret } from "../config.js";

export const validateAcess = async (req, res, next) => {
  try {
   
    const dataAuth = req.headers.authorization;
    if (!dataAuth) {
      return res
        .status(401)
        .json({ error: true, message: "No token provided" });
    }

    const dataToken = dataAuth.split(" ");
    const bearer = dataToken[0];
    if (bearer !== "Bearer") {
      return res
        .status(401)
        .json({ error: true, message: "Invalid format token" });
    }

    const token = dataToken[1];

    const decodedToken = await validateToken(token, secret);
    if (decodedToken.error === true) {
      return res
        .status(401)
        .json({ error: true, message: decodedToken.message });
    }

    const dataUser = await dbControllers.user.getUser({
      user_id: decodedToken.results.user_id,
    });

    if (dataUser[0].length !== 1) {
      return res.status(401).json({ error: true, message: "Invalid token" });
    }

    req.headers.username = dataUser[0][0].username;
    req.headers.user_id = dataUser[0][0].user_id;
    req.headers.name = dataUser[0][0]?.name;
    req.headers.userId = dataUser[0][0].id;
    req.headers.rol = dataUser[0][0].rol

    next();
  } catch (error) {}
};

export const decodeToken = async (token, secret) => {
  return await validateToken(token, secret);
};
