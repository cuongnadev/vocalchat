import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });
    // mainWindow.webContents.openDevTools({ mode: "detach" });


    console.log(`ELECTRON_DEV=${process.env.ELECTRON_DEV}`);
    if (process.env.ELECTRON_DEV === "true") {
        mainWindow.loadURL("http://localhost:5173");
    } else {
        mainWindow.loadFile(path.join(__dirname, "../web/index.html"));
    }
}


app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
