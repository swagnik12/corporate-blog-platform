import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/api/auth/signin")
    }

    const navLinks = [
        { name: "Dashboard", href: "/dashboard", icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { name: "Posts", href: "/dashboard/posts", icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
        { name: "Media", href: "/dashboard/media", icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { name: "Users", href: "/dashboard/users", icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    ]

    return (
        <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed top-16 bottom-0 z-10">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-white">
                    <Link href="/" className="flex items-center">
                        <span className="text-xl font-extrabold text-gray-900 tracking-tight">BlogBase</span>
                    </Link>
                </div>
                <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                        >
                            <span className="text-gray-500 group-hover:text-indigo-600 transition-colors">
                                <link.icon />
                            </span>
                            {link.name}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-gray-900 truncate">{session.user?.name ?? "User"}</span>
                            <span className="text-[11px] font-medium text-gray-500 truncate w-full">{session.user?.email}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-16 z-20">
                    <div className="flex items-center flex-1">
                        <div className="relative w-full max-w-sm hidden sm:block">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/blog">
                            <button className="text-sm font-semibold text-gray-800 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                View Blog
                            </button>
                        </Link>
                        <NotificationDropdown />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
