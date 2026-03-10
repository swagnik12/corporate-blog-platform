"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Badge } from "@/components/ui/Badge";

interface Post {
    id: string;
    title: string;
    slug: string;
    bannerImage?: string | null;
    content: { text?: string } | string;
    status: "DRAFT" | "PUBLISHED";
    createdAt: string;
}

function extractText(content: Post["content"]): string {
    if (!content) return "";
    if (typeof content === "string") return content;
    if (typeof content === "object" && "text" in content) return content.text ?? "";
    return "";
}

export default function EditPostPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

    // UI States
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (file: File | null) => {
        if (!file || !file.type.startsWith("image/")) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            setBannerImage(data.url);
        } catch (err) {
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const slugPreview = title
        ? "/" + title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        : slug
            ? "/" + slug
            : "/post-slug";

    // ── Fetch post ──────────────────────────────────────────────────────────────
    useEffect(() => {
        fetch(`/api/posts/${id}`)
            .then(async (res) => {
                if (res.status === 404) { setNotFound(true); return; }
                if (!res.ok) throw new Error("Failed to load post");
                const data: Post = await res.json();
                setTitle(data.title);
                setSlug(data.slug);
                setContent(extractText(data.content));
                setStatus(data.status);
                setBannerImage(data.bannerImage || null);
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    // ── Save ────────────────────────────────────────────────────────────────────
    async function handleSave() {
        if (!title.trim()) { setError("Title is required"); return; }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`/api/posts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    slug: title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                    content: { text: content },
                    status: "DRAFT", // Saving normally defaults to Draft or keeps current
                    ...(bannerImage && { bannerImage }),
                }),
            });
            if (!res.ok) throw new Error("Failed to update post");
            setSuccess("Draft saved successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    async function handlePublish() {
        if (!title.trim()) { setError("Title is required to publish"); return; }
        if (!content.trim() || content === "<p></p>") { setError("Content is required to publish"); return; }

        setPublishing(true);
        setError(null);

        try {
            // First save any current changes as a PATCH but keep as current status
            await fetch(`/api/posts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    slug: title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                    content: { text: content },
                    ...(bannerImage && { bannerImage }),
                }),
            });

            const res = await fetch(`/api/posts/${id}/publish`, {
                method: "PUT",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to publish post");
            }

            router.push("/dashboard/posts");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setPublishing(false);
        }
    }

    // ── Delete ──────────────────────────────────────────────────────────────────
    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
        setDeleting(true);
        setError(null);
        try {
            const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete post");
            router.push("/dashboard/posts");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setDeleting(false);
        }
    }

    // ── Render states ───────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center py-40">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm font-medium">Loading editor…</p>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="py-40 flex items-center justify-center text-center">
                <Card className="p-16 max-w-md w-full border-gray-100 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <p className="text-gray-900 text-2xl font-bold mb-2">Post not found</p>
                    <p className="text-gray-500 text-sm mb-8">This post doesn&apos;t exist or you don&apos;t have access to it.</p>
                    <Link href="/dashboard/posts">
                        <Button variant="secondary" className="w-full">Return to Posts</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                        <span className="text-gray-300">/</span>
                        <Link href="/dashboard/posts" className="hover:text-indigo-600 transition-colors">Posts</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-900 font-semibold flex items-center gap-2">Edit Post</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Edit Post</h1>
                        <Badge variant={status.toLowerCase()} className="mt-1">{status}</Badge>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={handleSave} disabled={saving || publishing || deleting}>
                        {saving ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button variant="primary" onClick={handlePublish} disabled={saving || publishing || deleting}>
                        {publishing ? "Publishing..." : "Publish Post"}
                    </Button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                    {error}
                </div>
            )}

            {/* Success Banner */}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                    {success}
                </div>
            )}

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
                {/* Left Column: Editor */}
                <div className="space-y-6">
                    <Card className="p-6 md:p-8 border-gray-100 shadow-sm">
                        <div className="space-y-6">
                            {/* Post Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Post Title
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Enter your post title here..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-lg py-3"
                                />
                            </div>

                            {/* Rich Text Editor */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Content
                                </label>
                                <RichTextEditor value={content} onChange={setContent} />
                            </div>
                        </div>
                    </Card>

                    {/* Image Dropzone Mock */}
                    <Card className="p-6 md:p-8 border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Cover Image</h3>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                        />
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                handleFileChange(e.dataTransfer.files?.[0] ?? null);
                            }}
                            className={`w-full rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-400 hover:bg-gray-50"}`}
                        >
                            {uploading ? (
                                <div className="px-6 py-12 flex flex-col items-center justify-center text-center bg-gray-50">
                                    <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                                    <p className="text-sm font-semibold text-gray-900">Uploading...</p>
                                </div>
                            ) : bannerImage ? (
                                <div className="relative w-full h-48 group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={bannerImage} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                                                Replace
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => setBannerImage(null)}>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div onClick={() => fileInputRef.current?.click()} className="px-6 py-12 flex flex-col items-center justify-center text-center cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 shadow-sm">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">Upload New Image</p>
                                    <p className="text-xs text-gray-500">Supports JPG, PNG (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Settings */}
                <div className="space-y-6">
                    <Card className="p-6 border-gray-100 shadow-sm sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Post Settings</h2>

                        <div className="space-y-6">
                            {/* Category & Tags Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Category</label>
                                    <div className="relative">
                                        <select className="w-full appearance-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]">
                                            <option>Technology</option>
                                            <option>Business</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Tags</label>
                                    <Input type="text" placeholder="Add tags" className="py-2" />
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* SEO Preview Area */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Search Engine Preview</label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                                    <p className="text-xs text-indigo-700 font-medium truncate mb-1">yoursite.com {slugPreview}</p>
                                    <p className="text-sm text-blue-800 font-semibold leading-tight line-clamp-1 hover:underline cursor-pointer">{title || "Your Post Title Here"}</p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                        {content.slice(0, 150) || "Start writing your article content to generate a rich SEO preview for search engines based on your actual content..."}
                                    </p>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Danger Zone */}
                            <div>
                                <label className="block text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Danger Zone</label>
                                <Button
                                    variant="danger"
                                    className="w-full"
                                    onClick={handleDelete}
                                    disabled={deleting || saving}
                                >
                                    {deleting ? "Deleting..." : "Delete Post"}
                                </Button>
                                <p className="text-[10px] text-gray-400 mt-2 text-center">This action cannot be undone.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
