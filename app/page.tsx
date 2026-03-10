import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";

export const revalidate = 900;

function formatDate(dateStr: Date | string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function extractContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (content && typeof content === "object" && "text" in content) {
    return (content as { text?: string }).text ?? "";
  }
  return "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

export default async function LandingPage() {
  let latestPosts: any[] = [];
  try {
    latestPosts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        createdAt: true,
        publishedAt: true,
        bannerImage: true,
        categories: {
          select: { category: true }
        }
      }
    });
  } catch (e) {
    console.error("Failed to load latest posts", e);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col bg-gray-50 overflow-hidden relative">

      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-100/50 to-transparent rounded-full blur-3xl pointer-events-none opacity-60"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none opacity-50"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl pointer-events-none opacity-50"></div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto w-full text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-widest mb-8 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          BlogBase Platform
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] max-w-4xl mb-6">
          Modern Corporate <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Blogging Platform
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
          A lightning-fast, beautifully designed CMS made for corporate teams. Focus on writing engaging content while we handle the distribution and formatting.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 px-8 text-base">
              Open Dashboard
            </Button>
          </Link>
          <Link href="/blog" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full px-8 text-base bg-white/80 backdrop-blur">
              Read Blog
            </Button>
          </Link>
        </div>

      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-white border-t border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Everything you need to publish</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Ship thought leadership to your audience with tools designed strictly for speed and readability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white mb-6 shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Write Faster</h3>
              <p className="text-gray-500 leading-relaxed">
                Enjoy a distraction-free, simple publishing workflow. Go from draft to published in seconds.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white mb-6 shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">SEO Optimized</h3>
              <p className="text-gray-500 leading-relaxed">
                Every post automatically generates perfect Next.js 15 App Router metadata for social sharing.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white mb-6 shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Modern Dashboard</h3>
              <p className="text-gray-500 leading-relaxed">
                Track all your drafts and published posts in one beautiful, centralized command center.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Latest Articles Section */}
      <div className="relative z-10 bg-gray-50 border-t border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Latest Articles</h2>
              <p className="text-gray-500 mt-2 max-w-2xl">Read our most recent thoughts, updates, and tutorials.</p>
            </div>
            <Link href="/blog">
              <Button variant="secondary" className="group">
                View all articles
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-lg">No articles published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post) => {
                const readingTime = Math.max(1, calculateReadingTime(stripHtml(extractContent(post.content))));

                return (
                  <Link href={`/blog/${post.slug}`} key={post.id} className="block group">
                    <Card className="h-full flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-gray-100 bg-white">
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
                            className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1"
                          >
                            {formatDate(post.publishedAt || post.createdAt)}
                          </time>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {post.categories && post.categories.length > 0 ? (
                              <Badge variant={post.categories[0].category.slug}>{post.categories[0].category.name}</Badge>
                            ) : (
                              <Badge variant="technology">Article</Badge>
                            )}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5 mt-auto">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {readingTime} min read
                        </p>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}