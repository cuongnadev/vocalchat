import { contextBridge } from "electron";


console.log("loaded!");

contextBridge.exposeInMainWorld("electronAPI", {
    myMethod: () => console.log("Hello from preload")
});

contextBridge.exposeInMainWorld("env", {
  isElectron: true
});
