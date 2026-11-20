import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", project: "SIIPMS", message: "Backend is working" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("SIIPMS backend running at http://localhost:" + PORT));
