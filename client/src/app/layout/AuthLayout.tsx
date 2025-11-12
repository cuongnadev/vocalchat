import SplashCursor from "@/components/ui/splashcursor/SplashCursor"
import { Outlet } from "@tanstack/react-router"

function AuthLayout() {
    return (
        <div className="relative w-full min-h-screen flex items-center justify-center bg-linear-to-br from-[#0a001f] via-[#10002b] to-[#1b0038] overflow-hidden">
            <SplashCursor />

            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />
            </div>

            <Outlet />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                © 2025 VocalChat — Let’s talk, anywhere.
            </div>
        </div>
    )
}

export default AuthLayout