import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const revalidate = 900; // ISR — regenerate every 15 minutes

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const categories = await prisma.category.findMany({
        select: { slug: true },
    });
    return categories.map((c) => ({ slug: c.slug }));
}

function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;

    const category = await prisma.category.findUnique({
        where: { slug },
        include: {
            posts: {
                include: {
                    post: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            excerpt: true,
                            status: true,
                            publishedAt: true,
                            createdAt: true,
                            bannerImage: true,
                        },
                    },
                },
            },
        },
    });

    if (!category) {
        notFound();
    }

    // Extract, filter PUBLISHED, and sort by publishedAt DESC
    const posts = category.posts
        .map((p) => p.post)
        .filter((post) => post.status === "PUBLISHED")
        .sort((a, b) => {
            const dateA = a.publishedAt ?? a.createdAt;
            const dateB = b.publishedAt ?? b.createdAt;
            return dateB.getTime() - dateA.getTime();
        });

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/blog" className="hover:text-indigo-600 transition-colors font-medium">
                            Blog
                        </Link>
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-900 font-semibold">Category</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="mb-3">
                                <Badge variant={category.slug}>{category.name}</Badge>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                                {category.name}
                            </h1>
                            <p className="text-gray-500 mt-3 text-lg">
                                {posts.length} published {posts.length === 1 ? "post" : "posts"} in this category
                            </p>
                        </div>
                        <Link href="/blog">
                            <Button variant="secondary" className="shrink-0 gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                All Posts
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                {/* Empty state */}
                {posts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <p className="text-gray-900 text-xl font-bold mb-2">No posts available in this category.</p>
                        <p className="text-gray-500 text-sm mb-8">Check back later or browse all posts.</p>
                        <Link href="/blog">
                            <Button variant="secondary">Browse All Posts</Button>
                        </Link>
                    </div>
                )}

                {/* Posts grid */}
                {posts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className="block group">
                                <Card className="h-full flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-gray-100">
                                    {post.bannerImage ? (
                                        <div className="relative w-full h-48 bg-gray-100 overflow-hidden shrink-0 border-b border-gray-100">
                                            <Image
                                                src={post.bannerImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-48 bg-gray-50 flex items-center justify-center shrink-0 border-b border-gray-100">
                                            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <time
                                                dateTime={(post.publishedAt ?? post.createdAt).toISOString()}
                                                className="text-xs font-semibold text-gray-400 uppercase tracking-widest"
                                            >
                                                {formatDate(post.publishedAt ?? post.createdAt)}
                                            </time>
                                            <Badge variant={category.slug}>{category.name}</Badge>
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                                            {post.title}
                                        </h2>

                                        {post.excerpt && (
                                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                                                {post.excerpt}
                                            </p>
                                        )}

                                        <div className="mt-auto pt-6">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-colors"
                                            >
                                                Read More
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
