"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

// ─── Avatar helper ────────────────────────────────────────────────────────────

function UserAvatar({ name, image, size = 36 }: { name?: string | null; image?: string | null; size?: number }) {
    const initials = name
        ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    if (image) {
        return (
            <Image
                src={image}
                alt={name ?? "User"}
                width={size}
                height={size}
                className="rounded-full object-cover ring-2 ring-white"
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <div
            className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-white select-none"
            style={{ width: size, height: size, fontSize: size * 0.36 }}
        >
            {initials}
        </div>
    );
}

// ─── Dropdown Item ────────────────────────────────────────────────────────────

function DropdownItem({ href, onClick, icon, children }: {
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    const cls = "flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-lg mx-1 cursor-pointer";
    if (href) {
        return (
            <Link href={href} className={cls} onClick={onClick}>
                <span className="w-4 h-4 shrink-0">{icon}</span>
                {children}
            </Link>
        );
    }
    return (
        <button onClick={onClick} className={`${cls} w-full text-left`}>
            <span className="w-4 h-4 shrink-0">{icon}</span>
            {children}
        </button>
    );
}

// ─── Public Navbar ────────────────────────────────────────────────────────────

export function PublicNavbar() {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const user = session?.user;
    const closeAll = () => { setIsMobileMenuOpen(false); setIsDropdownOpen(false); };

    return (
        <nav className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Left: Logo */}
                <div className="flex shrink-0 items-center">
                    <Link href="/" className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                            <span className="text-sm font-black">B</span>
                        </div>
                        BlogBase
                    </Link>
                </div>

                {/* Center: Desktop Links */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">
                        Home
                    </Link>
                    <Link href="/blog" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">
                        Blog
                    </Link>
                    <Link href="/search" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">
                        Search
                    </Link>
                </div>

                {/* Right: Auth */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    {status === "loading" ? (
                        <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
                    ) : user ? (
                        /* ── Avatar + Dropdown ── */
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen((v) => !v)}
                                className="flex items-center gap-2.5 rounded-2xl hover:bg-gray-50 px-2 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                aria-expanded={isDropdownOpen}
                                aria-haspopup="true"
                            >
                                <UserAvatar name={user.name} image={user.image} />
                                <div className="text-left hidden lg:block">
                                    <p className="text-sm font-semibold text-gray-900 leading-tight truncate max-w-[120px]">
                                        {user.name ?? "User"}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{user.email}</p>
                                </div>
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Panel */}
                            <div
                                className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 origin-top-right transition-all duration-200 ${isDropdownOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                                    }`}
                                role="menu"
                            >
                                {/* User identity */}
                                <div className="px-4 py-3 border-b border-gray-100 mb-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Signed in as</p>
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name ?? "User"}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>

                                <DropdownItem href="/dashboard" onClick={closeAll} icon={
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                }>
                                    Dashboard
                                </DropdownItem>

                                <DropdownItem href="/dashboard/posts" onClick={closeAll} icon={
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                }>
                                    My Posts
                                </DropdownItem>

                                <div className="h-px bg-gray-100 mx-3 my-1.5" />

                                <DropdownItem onClick={() => { closeAll(); signOut({ callbackUrl: "/" }); }} icon={
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                }>
                                    <span className="text-red-600">Sign Out</span>
                                </DropdownItem>
                            </div>
                        </div>
                    ) : (
                        /* ── Signed-out buttons ── */
                        <div className="flex items-center gap-2">
                            <Link
                                href="/api/auth/signin"
                                className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/api/auth/signin"
                                className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-2 shrink-0">
                    {/* Show avatar on mobile even without menu open */}
                    {user && <UserAvatar name={user.name} image={user.image} size={32} />}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen
                            ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        }
                    </button>
                </div>
            </div>

            {/* Mobile Nav Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white absolute top-16 left-0 w-full shadow-xl">
                    <div className="px-6 py-5 flex flex-col gap-1">
                        {/* User identity on mobile */}
                        {user && (
                            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-2xl">
                                <UserAvatar name={user.name} image={user.image} size={40} />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{user.name ?? "User"}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <Link href="/" onClick={closeAll} className="px-3 py-2.5 text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">Home</Link>
                        <Link href="/blog" onClick={closeAll} className="px-3 py-2.5 text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">Blog</Link>
                        <Link href="/search" onClick={closeAll} className="px-3 py-2.5 text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">Search</Link>

                        <div className="h-px bg-gray-100 my-2" />

                        {status === "loading" ? (
                            <div className="w-full h-10 bg-gray-100 rounded-xl animate-pulse" />
                        ) : user ? (
                            <>
                                <Link href="/dashboard" onClick={closeAll} className="px-3 py-2.5 text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">Dashboard</Link>
                                <Link href="/dashboard/posts" onClick={closeAll} className="px-3 py-2.5 text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">My Posts</Link>
                                <button
                                    onClick={() => { closeAll(); signOut({ callbackUrl: "/" }); }}
                                    className="px-3 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left mt-1"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/api/auth/signin" onClick={closeAll} className="px-3 py-2.5 text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">Sign In</Link>
                                <Link
                                    href="/api/auth/signin"
                                    onClick={closeAll}
                                    className="mt-1 block text-center font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 rounded-xl text-sm"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
