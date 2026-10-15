import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { translateText } from "../controllers/translateController.js";

const router = express.Router();

router.post("/", protectRoute, translateText);

export default router;
