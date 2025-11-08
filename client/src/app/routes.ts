import { createRootRoute, createRoute, redirect } from "@tanstack/react-router";
import Chat from "@/pages/chat/Chat";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ChatLayout from "./layout/ChatLayout";
import AuthLayout from "./layout/AuthLayout";
import { isLoggedIn } from "@/utils/auth";
import VerifyCode from "@/pages/auth/VerifyCode";
import ProfileInfo from "@/pages/auth/ProfileInfo";

const rootRoute = createRootRoute();

const chatLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatLayout,
});

const chatRoute = createRoute({
  getParentRoute: () => chatLayoutRoute,
  path: "/",
  component: Chat,
  // Bypass
  loader: () => {
    // if (!isLoggedIn()) {
    //   return redirect({ to: "/auth/login" });
    // }
    return null;
  },
});

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthLayout,
});

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

const verifyCode = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/register/verify-code",
  component: VerifyCode,
});

const profileInfo = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/register/profile-info",
  component: ProfileInfo,
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
  authLayoutRoute.addChildren([
    loginRoute,
    registerRoute,
    verifyCode,
    profileInfo,
  ]),
]);
