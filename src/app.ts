import express from "express";
import { httpRequestCounter } from "./config/metrics.js";
import healthRoutes from "./routes/healthRoutes.js";
import monitoringRoutes from "./routes/monitoringRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
  });
  next();
});

app.use("/health", healthRoutes);
app.use("/monitoring", monitoringRoutes);
app.use("/payments", paymentRoutes);

export default app;
