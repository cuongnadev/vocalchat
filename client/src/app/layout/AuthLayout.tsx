import { Outlet } from "@tanstack/react-router"

function AuthLayout() {
    return (
        <>
            <div>AuthLayout</div>
            <Outlet />
        </>
    )
}

export default AuthLayout