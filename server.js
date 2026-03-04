import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, "dist");

// Serve static files
app.use(express.static(distPath));

// ✅ Express 5 safe SPA fallback (DO NOT use app.get("*"))
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Web service running on port ${PORT}`);
});