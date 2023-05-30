import { Router } from "express";
import { validateAcess } from "../middleware/middleware.js";
import { createTasks, searchTasks, updateTask, deleteTask } from "../controllers/tasks.js";
const route = Router();

route.post("/new", validateAcess, createTasks);
route.post("/", validateAcess, searchTasks);
route.put("/", validateAcess, updateTask);
route.delete("/:id", validateAcess, deleteTask);
export default route;
