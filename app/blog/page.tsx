import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";

export const revalidate = 900; // Regenerate every 15 minutes

function formatDate(dateStr: Date) {
    return dateStr.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

type BlogPost = {
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
    publishedAt: Date | null;
    bannerImage: string | null;
    excerpt: string | null;
    categories: { category: { id: string; name: string; slug: string } }[];
};

export default async function BlogPage() {
    let posts: BlogPost[] = [];
    let fetchError = false;

    try {
        console.time("getPublishedPosts")
        posts = await prisma.post.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { publishedAt: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                createdAt: true,
                publishedAt: true,
                bannerImage: true,
                excerpt: true,
                categories: {
                    select: {
                        category: true,
                    }
                }
            }
        });
        console.timeEnd("getPublishedPosts")
    } catch {
        fetchError = true;
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header / Hero */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Public Blog Feed
                    </h1>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                        Insights and updates from our corporate team. Discover our latest thoughts.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Error state */}
                {fetchError && (
                    <div className="text-center py-12">
                        <p className="text-red-500 text-sm bg-red-50 inline-block px-4 py-2 rounded-xl border border-red-100">
                            Failed to load posts. Please try again later.
                        </p>
                    </div>
                )}

                {/* Empty state */}
                {!fetchError && posts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-gray-900 text-lg font-medium">No published posts yet.</p>
                        <p className="text-sm text-gray-700 mt-2">Check back later for updates.</p>
                    </div>
                )}

                {/* Post list */}
                {!fetchError && posts.length > 0 && (
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
                                                dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
                                                className="text-xs font-bold text-gray-700 uppercase tracking-widest mt-1"
                                            >
                                                {formatDate(post.publishedAt || post.createdAt)}
                                            </time>
                                            <div className="flex gap-2 flex-wrap justify-end">
                                                {post.categories && post.categories.length > 0 ? (
                                                    post.categories.map(pc => (
                                                        <Badge key={pc.category.id} variant={pc.category.slug}>{pc.category.name}</Badge>
                                                    ))
                                                ) : (
                                                    <Badge variant="technology">Article</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                                            {post.title}
                                        </h2>
                                        {post.excerpt && (
                                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 mb-4">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="mt-auto pt-2">
                                            <Button variant="secondary" size="sm" className="w-full group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-colors">
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
    )
}
