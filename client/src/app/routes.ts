import { createRootRoute, createRoute, redirect } from "@tanstack/react-router";
import Chat from "@/pages/chat/Chat.tsx";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ChatLayout from "./layout/ChatLayout";
import AuthLayout from "./layout/AuthLayout";
import { isLoggedIn } from "@/utils/auth";

const rootRoute = createRootRoute();

const chatLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/chat",
    component: ChatLayout
})

const chatRoute = createRoute({
    getParentRoute: () => chatLayoutRoute,
    path: "/",
    component: Chat,
    loader: () => {
    if (!isLoggedIn()) {
      return redirect({ to: "/auth/login" });
    }
    return null;
  },
});

const authLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth",
    component: AuthLayout,
})

const loginRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: "/login",
    component: Login,
});

const registerRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: "/register",
    component: Register,
});

const rootRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  loader: () => {
    if (isLoggedIn()) return redirect({ to: "/chat" });
    return redirect({ to: "/auth/login" });
  },
});

export const routeTree = rootRoute.addChildren([
    rootRedirectRoute,
    chatLayoutRoute.addChildren([chatRoute]),
    authLayoutRoute.addChildren([loginRoute, registerRoute]),
]);
