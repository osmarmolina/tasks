import { Router } from "express";
import { signIn, logIn, getUsers } from "../controllers/user.js";
import { validateAcess } from "../middleware/middleware.js";
const route = Router();

route.post("/sign-in", signIn);
route.post("/log-in", logIn);
route.post("/",validateAcess, getUsers);

export default route;
