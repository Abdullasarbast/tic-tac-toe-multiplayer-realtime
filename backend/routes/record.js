import express from "express";

import { getRecords } from "../controllers/record.js";

const router = express.Router();

router.get("/", getRecords);


export default router;
