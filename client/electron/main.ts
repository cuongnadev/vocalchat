import { app, BrowserWindow } from "electron";
import Store from "electron-store";
import path from "path";
import { fileURLToPath } from "url";
import 'dotenv/config';

interface WindowState {
    width: number;
    height: number;
}
type Schema = {
  windowState: WindowState;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store<Schema>({
  schema: {
    windowState: {
      type: "object",
      properties: {
        width: { type: "number" },
        height: { type: "number" }
      },
      required: ["width", "height"]
    }
  },
  defaults: {
    windowState: { width: 1280, height: 800 }
  }
});

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    const savedState = store.get("windowState");
    const windowState: WindowState = savedState ?? { width: 1280, height: 800 };

    mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        icon: path.join(__dirname, "../web/logo.ico"),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });
    mainWindow.on("resize", () => {
        const bounds = mainWindow?.getBounds();
        if (bounds) {
            const { width, height } = bounds;
            store.set("windowState", { width, height });
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
