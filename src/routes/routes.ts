import { Router } from "express";
import { identify } from "../controller/contactController";

const router = Router();

router.post("/identify", identify);

export default router;
