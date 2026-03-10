"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Post {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    slug: string;
    bannerImage?: string | null;
    categories?: { category: Category }[];
}

interface ApiResponse {
    posts: Post[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const ChevronIcon = () => (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const SELECT_CLASS =
    "appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer pr-10";

// ─── Page Component ───────────────────────────────────────────────────────────

export default function PostsPage() {
    // Filter state
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatus] = useState("");
    const [dateFilter, setDate] = useState("");
    const [categoryFilter, setCategory] = useState("");

    // Data state
    const [posts, setPosts] = useState<Post[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const LIMIT = 10;

    // Debounce search input by 400 ms
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // reset to page 1 on new search
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    // Fetch categories once
    useEffect(() => {
        fetch("/api/categories")
            .then((r) => r.ok ? r.json() : [])
            .then((data: Category[]) => setCategories(data))
            .catch(() => { });
    }, []);

    // Fetch posts whenever filters or page change
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (statusFilter) params.set("status", statusFilter);
        if (dateFilter) params.set("date", dateFilter);
        if (categoryFilter) params.set("category", categoryFilter);
        params.set("page", String(page));
        params.set("limit", String(LIMIT));

        try {
            const res = await fetch(`/api/posts?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to load posts");
            const data: ApiResponse = await res.json();
            setPosts(data.posts);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, statusFilter, dateFilter, categoryFilter, page]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Reset page to 1 when filters change
    useEffect(() => { setPage(1); }, [statusFilter, dateFilter, categoryFilter]);

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-900 font-semibold">Posts</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage All Posts</h1>
                </div>
                <Link href="/dashboard/posts/new">
                    <Button variant="primary">
                        <span className="mr-2 text-indigo-100">+</span> New Post
                    </Button>
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search posts by title or slug..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                    />
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Date range */}
                    <div className="relative">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDate(e.target.value)}
                            className={SELECT_CLASS}
                        >
                            <option value="">All Time</option>
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><ChevronIcon /></span>
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatus(e.target.value)}
                            className={SELECT_CLASS}
                        >
                            <option value="">All Statuses</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><ChevronIcon /></span>
                    </div>

                    {/* Category */}
                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategory(e.target.value)}
                            className={SELECT_CLASS}
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.slug}>{c.name}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><ChevronIcon /></span>
                    </div>

                    {/* Clear filters button */}
                    {(search || statusFilter || dateFilter || categoryFilter) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch(""); setDebouncedSearch("");
                                setStatus(""); setDate(""); setCategory("");
                                setPage(1);
                            }}
                        >
                            Clear filters ×
                        </Button>
                    )}
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-500 font-medium">
                {!loading && !error && (
                    <span>
                        {total === 0 ? "No posts found" : `Showing ${Math.min((page - 1) * LIMIT + 1, total)}–${Math.min(page * LIMIT, total)} of ${total} posts`}
                    </span>
                )}
            </div>

            {/* Column Headers */}
            <div className="hidden md:grid grid-cols-[64px_1fr_150px_130px_100px_60px] gap-4 px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 items-center">
                <span>Image</span>
                <span>Post Title</span>
                <span>Created</span>
                <span>Status</span>
                <span>Slug</span>
                <span className="text-right">Edit</span>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm font-medium">Loading posts…</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && posts.length === 0 && (
                <Card className="p-16 flex flex-col items-center justify-center text-center">
                    <div className="bg-indigo-50 text-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mb-5">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {search || statusFilter || dateFilter || categoryFilter ? "No matching posts" : "No posts yet"}
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-sm text-sm">
                        {search || statusFilter || dateFilter || categoryFilter
                            ? "Try adjusting your search or filters."
                            : "Create your first post to start sharing your thoughts."
                        }
                    </p>
                    {!search && !statusFilter && !dateFilter && !categoryFilter && (
                        <Link href="/dashboard/posts/new">
                            <Button variant="primary" size="lg">Create New Post</Button>
                        </Link>
                    )}
                </Card>
            )}

            {/* Posts List */}
            {!loading && !error && posts.length > 0 && (
                <div className="space-y-2">
                    {posts.map((post) => (
                        <Card key={post.id} className="p-4 md:px-6 md:py-4 hover:border-indigo-200 hover:shadow-md transition-all duration-200 group relative">
                            <div className="grid grid-cols-1 md:grid-cols-[64px_1fr_150px_130px_100px_60px] gap-4 items-center">
                                {/* Thumbnail */}
                                <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                                    {post.bannerImage ? (
                                        <Image
                                            src={post.bannerImage}
                                            alt={post.title}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Title & Categories */}
                                <div className="min-w-0 pr-2">
                                    <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors flex items-center flex-wrap gap-2">
                                        <Link href={`/dashboard/posts/${post.id}`} className="focus:outline-none truncate max-w-full block">
                                            <span className="absolute inset-0 z-10" aria-hidden="true" />
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <p className="text-xs text-gray-400 font-mono">/{post.slug}</p>
                                        {post.categories && post.categories.length > 0 && (
                                            <div className="flex flex-wrap gap-1 ml-2 border-l pl-3 border-gray-100">
                                                {post.categories.map((pc) => (
                                                    <Link
                                                        key={pc.category.id}
                                                        href={`/blog/category/${pc.category.slug}`}
                                                        className="relative z-20 hover:opacity-80 transition-opacity"
                                                    >
                                                        <Badge variant="neutral">{pc.category.name}</Badge>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="hidden md:block text-sm font-medium text-gray-500">
                                    {formatDate(post.createdAt)}
                                </div>

                                {/* Status */}
                                <div>
                                    <Badge variant={post.status.toLowerCase()}>{post.status}</Badge>
                                </div>

                                {/* Slug (truncated) */}
                                <div className="hidden md:block">
                                    <span className="text-xs text-gray-400 font-mono truncate block max-w-[90px]">{post.slug}</span>
                                </div>

                                {/* Action */}
                                <div className="flex md:justify-end relative z-20">
                                    <Link href={`/dashboard/posts/${post.id}`}>
                                        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                                            <span className="sr-only">Edit</span>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-gray-500 font-medium hidden sm:block">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="px-3"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Button>

                        {/* Page number pills */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                if (idx > 0 && (arr[idx - 1] as number) !== p - 1) acc.push("...");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, idx) =>
                                p === "..." ? (
                                    <span key={`ellipsis-${idx}`} className="text-gray-400 px-1 text-sm">…</span>
                                ) : (
                                    <Button
                                        key={p}
                                        variant={p === page ? "primary" : "ghost"}
                                        size="sm"
                                        className="w-9 h-9 p-0 font-bold shadow-none"
                                        onClick={() => setPage(p as number)}
                                    >
                                        {p}
                                    </Button>
                                )
                            )}

                        <Button
                            variant="secondary"
                            size="sm"
                            className="px-3"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
