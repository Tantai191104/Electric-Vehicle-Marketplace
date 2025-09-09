import express from "express";
import { createUser, loginUser, listUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);

router.use(authenticate);

router.get("/list", listUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
