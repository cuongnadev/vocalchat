import { Outlet } from "@tanstack/react-router"

function AuthLayout() {
    return (
        <>
            <div className="flex items-center justify-center h-screen">
                <Outlet />
            </div>
        </>
    )
}

export default AuthLayout