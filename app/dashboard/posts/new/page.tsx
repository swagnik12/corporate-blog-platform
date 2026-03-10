"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

type Category = { id: string; name: string; slug: string };

export default function NewPostPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch real categories from the API
    useEffect(() => {
        fetch("/api/categories")
            .then((r) => r.json())
            .then((data: Category[]) => setCategories(data))
            .catch(() => {/* silently ignore — category dropdown will be empty */ });
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const slugPreview = title
        ? "/" + title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        : "/example-post-title";

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

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFileChange(file);
    };

    const handleSubmit = async (publish: boolean) => {
        if (!title.trim()) {
            alert("Title is required");
            return;
        }
        setSaving(true);
        try {
            // Step 1: Create draft — include categoryId so PostCategory is created atomically
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content: { text: content },
                    ...(categoryId && { categoryId }),
                    ...(bannerImage && { bannerImage }),
                }),
            });

            if (!res.ok) throw new Error("Failed to create post");
            const post = await res.json();

            // Step 2: Publish + carry categoryId through so it is preserved
            if (publish) {
                const patchRes = await fetch(`/api/posts/${post.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: "PUBLISHED",
                        ...(categoryId && { categoryId }),
                    }),
                });
                if (!patchRes.ok) throw new Error("Created but failed to publish");
            }

            window.location.href = "/dashboard/posts";
        } catch (err) {
            alert(err instanceof Error ? err.message : "Something went wrong");
            setSaving(false);
        }
    };

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
                        <span className="text-gray-900 font-semibold flex items-center gap-2">Create New Post</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create &amp; Edit Post</h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={saving}>
                        {saving ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button variant="primary" onClick={() => handleSubmit(true)} disabled={saving}>
                        Publish Post
                    </Button>
                </div>
            </div>

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

                    <Card className="p-6 md:p-8 border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Cover Image</h3>
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                        />

                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`w-full rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden ${isDragging
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-200"
                                }`}
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
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-gray-50"
                                >
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 shadow-sm">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">Drag &amp; Drop or Click to Upload</p>
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
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="w-full appearance-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]"
                                        >
                                            <option value="">No category</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Tags</label>
                                    <Input
                                        type="text"
                                        placeholder="Add tags"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="py-2"
                                    />
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

                            {/* Author */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Author</label>
                                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                            Y
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">You</p>
                                            <p className="text-[10px] text-gray-500">Current User</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
