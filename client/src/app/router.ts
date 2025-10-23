import { createBrowserHistory, createHashHistory, createRouter } from '@tanstack/react-router'
import { routeTree } from "./routes";

const isElectron = navigator.userAgent.toLowerCase().includes("electron");
const history = isElectron ? createHashHistory() : createBrowserHistory();

export const router = createRouter({ routeTree, history });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
