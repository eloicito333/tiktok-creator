import express from "express"
import cors from "cors"
import { __rootdirname } from "#src/dirnames.js";
import path from "path";
import morgan from "morgan"
import { videoRouter } from "#src/routes/video/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("combined"))

app.use('/video', videoRouter)

app.use('/resources', express.static(path.join(__rootdirname, 'resources')));
app.use('/storage', express.static(path.join(__rootdirname, 'storage')));

// Serve OpenAPI JSON file
app.get("/openapi.json", (req, res) => {
    const openApiPath = path.join(__rootdirname, "openapi.json");
    res.sendFile(openApiPath);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});