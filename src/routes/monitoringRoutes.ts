import { Router } from "express";
import { register } from "../config/metrics.js";

const router = Router();

router.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

export default router;
