import { Outlet } from "@tanstack/react-router"

function ChatLayout() {
    return (
        <>
            <div>ChatLayout</div>
            <Outlet />
        </>
    );
}

export default ChatLayout