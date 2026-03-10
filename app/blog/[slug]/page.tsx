import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { TableOfContents } from "@/components/blog/TableOfContents"

interface PageProps {
    params: Promise<{ slug: string }>
}

export const revalidate = 900; // Regenerate every 15 minutes

export async function generateStaticParams() {
    const posts = await prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true }
    });

    return posts.map((post) => ({
        slug: post.slug
    }));
}

interface PostApiResponse {
    id: string
    title: string
    slug: string
    content: unknown
    createdAt: string
}

function extractContent(content: unknown): string {
    if (typeof content === "string") return content
    if (content && typeof content === "object" && "text" in content) {
        return (content as { text?: string }).text ?? ""
    }
    return ""
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
}

function formatDate(dateStr: string | Date) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

function calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

function parseHeadings(html: string) {
    const headings: { id: string; text: string; level: number }[] = [];
    const modifiedHtml = html.replace(/<h([2-3])>(.*?)<\/h\1>/gi, (match, level, text) => {
        const plainText = text.replace(/<[^>]*>?/gm, '');
        const id = slugify(plainText);
        headings.push({ id, text: plainText, level: parseInt(level) });
        return `<h${level} id="${id}">${text}</h${level}>`;
    });
    return { modifiedHtml, headings };
}

// ─── Dynamic SEO Metadata (fetch-based, no direct Prisma) ────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const headersList = await headers()
    const host = headersList.get("host") ?? "localhost:3000"
    const protocol = host.startsWith("localhost") ? "http" : "https"
    const origin = `${protocol}://${host}`

    const res = await fetch(
        `${origin}/api/public/posts/${slug}`,
        { cache: "no-store" }
    )

    if (!res.ok) {
        notFound()
    }

    const post: PostApiResponse = await res.json()

    const rawContent = extractContent(post.content)
    const description = stripHtml(rawContent).slice(0, 150)
    const url = `${origin}/blog/${post.slug}`

    return {
        title: post.title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: post.title,
            description,
            url,
            type: "article",
            publishedTime: post.createdAt,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description,
        },
    }
}

// ─── Page Component (Prisma direct — runs in RSC, no metadata conflict) ──────

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params
    console.time("getPostBySlug")
    const post = await prisma.post.findFirst({
        where: {
            slug,
            status: "PUBLISHED",
        },
        include: {
            author: {
                select: {
                    name: true,
                    image: true,
                }
            },
            categories: {
                include: {
                    category: true,
                }
            }
        }
    })
    console.timeEnd("getPostBySlug")

    if (!post) {
        notFound()
    }

    const content = extractContent(post.content)
    const { modifiedHtml, headings } = parseHeadings(content)
    const rawText = stripHtml(content)
    const readingTime = Math.max(1, calculateReadingTime(rawText))

    // Record View and Fetch Count
    await prisma.postView.create({
        data: { postId: post.id }
    })
    const viewCount = await prisma.postView.count({
        where: { postId: post.id }
    })

    // Fetch Related Posts
    const categoryIds = post.categories.map((pc) => pc.categoryId)
    let relatedPosts: any[] = []

    if (categoryIds.length > 0) {
        relatedPosts = await prisma.post.findMany({
            where: {
                status: "PUBLISHED",
                slug: { not: post.slug },
                categories: {
                    some: { categoryId: { in: categoryIds } }
                }
            },
            take: 3,
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
                    select: { category: true }
                }
            }
        })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'
    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        author: {
            "@type": "Person",
            name: post.author?.name || "Corporate Team",
        },
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt,
        image: post.bannerImage || undefined,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${baseUrl}/blog/${post.slug}`,
        },
    }

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": `${baseUrl}`
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": `${baseUrl}/blog`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": `${baseUrl}/blog/${post.slug}`
            }
        ]
    }

    return (
        <main className="min-h-screen bg-white pb-24">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Hero Image Section */}
            {post.bannerImage && (
                <div className="w-full h-[400px] md:h-[600px] relative bg-gray-100">
                    <Image
                        src={post.bannerImage}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
            )}

            {/* Header Content */}
            <div className={`max-w-4xl mx-auto px-6 ${post.bannerImage ? "-mt-32 relative z-10" : "pt-24"}`}>
                <div className={`bg-white ${post.bannerImage ? "rounded-3xl shadow-xl p-8 md:p-12 border border-gray-200" : ""}`}>
                    <Link
                        href="/blog"
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-200 inline-flex items-center gap-2 mb-6 group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to blog
                    </Link>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.15] mb-8">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 pb-8 border-b border-gray-200">
                        {/* Author Avatar */}
                        {post.author?.image ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 relative">
                                <Image src={post.author.image} alt={post.author.name || "Author"} fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                                {post.author?.name ? post.author.name.charAt(0).toUpperCase() : "C"}
                            </div>
                        )}

                        {/* Metadata Line */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                            <span className="font-semibold text-gray-900">{post.author?.name || "Corporate Team"}</span>
                            <span>•</span>
                            <time dateTime={post.createdAt.toISOString()}>
                                {formatDate(post.createdAt)}
                            </time>
                            <span>•</span>
                            <span>{readingTime} min read</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {viewCount} views
                            </span>
                            <span>•</span>
                            <span className="text-indigo-700 font-semibold">
                                {post.categories && post.categories.length > 0 ? post.categories[0].category.name : "Technology"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Gradient accent line (only if no banner image so it doesn't clash) */}
            {!post.bannerImage && (
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar with Table of Contents */}
                    {headings.length >= 2 && (
                        <aside className="lg:w-1/4">
                            <div className="lg:sticky lg:top-24">
                                <TableOfContents headings={headings} />
                            </div>
                        </aside>
                    )}

                    {/* Article Content */}
                    <article className={`${headings.length >= 2 ? "lg:w-3/4" : "max-w-3xl mx-auto"}`}>
                        <div
                            className="prose prose-lg prose-indigo max-w-none text-gray-800 font-geist-sans"
                            dangerouslySetInnerHTML={{ __html: modifiedHtml }}
                        />
                    </article>
                </div>
            </div>

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
                <div className="bg-gray-50 border-t border-gray-200 py-16 md:py-24">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Related Posts</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <Link href={`/blog/${relatedPost.slug}`} key={relatedPost.id} className="block group">
                                    <Card className="h-full flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-gray-100 bg-white">
                                        {relatedPost.bannerImage ? (
                                            <div className="relative w-full h-48 bg-gray-100 overflow-hidden shrink-0 border-b border-gray-100">
                                                <Image
                                                    src={relatedPost.bannerImage}
                                                    alt={relatedPost.title}
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
                                                    dateTime={relatedPost.publishedAt?.toISOString() || relatedPost.createdAt.toISOString()}
                                                    className="text-xs font-bold text-gray-700 uppercase tracking-widest mt-1"
                                                >
                                                    {formatDate(relatedPost.publishedAt || relatedPost.createdAt)}
                                                </time>
                                                <div className="flex gap-2 flex-wrap justify-end">
                                                    {relatedPost.categories && relatedPost.categories.length > 0 ? (
                                                        relatedPost.categories.map((pc: any) => (
                                                            <Badge key={pc.category.id} variant={pc.category.slug}>{pc.category.name}</Badge>
                                                        ))
                                                    ) : (
                                                        <Badge variant="technology">Article</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                                                {relatedPost.title}
                                            </h3>
                                            {relatedPost.excerpt && (
                                                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 mb-4">
                                                    {relatedPost.excerpt}
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
                    </div>
                </div>
            )}
        </main>
    )
}
