import { Outlet } from "@tanstack/react-router";

function ChatLayout() {
  return (
    <main className="bg-gray-100 w-full h-screen">
      <Outlet />
    </main>
  );
}

export default ChatLayout;
