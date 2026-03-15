import express, { type Application } from "express";
import cors from "cors";
import registerRoutes from "./routes/index.ts";
import {
  errorMiddleware,
  notFoundHandler,
} from "./middlewares/error.midleware.ts";

const app: Application = express();

app.use(cors());
app.use(express.json());

// standarization time zone
process.env.TZ = 'UTC';
// main app
app.use("/api", registerRoutes);

// not found route
app.use(notFoundHandler);
// ERROR MIDDLEWARE
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server E-Commerce berjalan di http://localhost:${PORT}`);
});