"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export default function AdminHeader() {
    const router = useRouter();

    const logout = () => {
        localStorage.removeItem("authToken");
        router.push("/login-signup");
    };

    const user = JSON.parse(localStorage.getItem("userData")) || {};

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
            <h1 className="text-xl font-bold text-gray-800">
                Admin Dashboard
            </h1>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <User className="w-5 h-5" />)}
                    <span className="text-sm font-medium">Admin</span>
                </div>

               
            </div>
        </header>
    );
}
