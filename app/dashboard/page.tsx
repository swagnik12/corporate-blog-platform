import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " mins ago"
  return Math.floor(seconds) + " seconds ago"
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return null
  }

  const [totalPosts, drafts, published, recentActivity, totalViews, trendingData] = await Promise.all([
    prisma.post.count({ where: { authorId: session.user.id } }),
    prisma.post.count({ where: { authorId: session.user.id, status: "DRAFT" } }),
    prisma.post.count({ where: { authorId: session.user.id, status: "PUBLISHED" } }),
    prisma.post.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, title: true, status: true, createdAt: true }
    }),
    prisma.postView.count({
      where: { post: { authorId: session.user.id } }
    }),
    prisma.postView.groupBy({
      by: ['postId'],
      _count: {
        postId: true
      },
      where: {
        post: {
          authorId: session.user.id,
          status: 'PUBLISHED'
        }
      },
      orderBy: {
        _count: {
          postId: 'desc'
        }
      },
      take: 5
    })
  ])

  // Fetch trending post details
  const trendingPosts = await Promise.all(
    trendingData.map(async (item) => {
      const post = await prisma.post.findUnique({
        where: { id: item.postId },
        select: { id: true, title: true, slug: true, bannerImage: true }
      });
      return { ...post, views: item._count.postId };
    })
  );

  const avgViews = totalPosts > 0 ? (totalViews / totalPosts).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Gradient Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 p-8 shadow-sm">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Welcome back, {session.user?.name?.split(" ")[0] ?? "there"}!
          </h1>
          <p className="text-indigo-50 text-sm font-medium">
            Your corporate blog is tracking well. Here&apos;s a quick overview.
          </p>
        </div>
        {/* Decorative blob */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <span className="font-semibold text-gray-800">Total Views</span>
          </div>
          <div className="text-4xl font-extrabold text-gray-900 tracking-tight">{totalViews}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <span className="font-semibold text-gray-800">Total Posts</span>
          </div>
          <div className="text-4xl font-extrabold text-gray-900 tracking-tight">{totalPosts}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <span className="font-semibold text-gray-800">Avg. Views</span>
          </div>
          <div className="text-4xl font-extrabold text-gray-900 tracking-tight">{avgViews}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trending Posts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Trending Posts</h2>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="space-y-5">
            {trendingPosts.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 italic text-center">No trending data yet.</p>
            ) : (
              trendingPosts.map((post) => (
                <div key={post.id} className="group flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                    {post.bannerImage ? (
                      <img src={post.bannerImage} alt={post.title ?? ""} className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      <Link href={`/blog/${post.slug}`} target="_blank">{post.title}</Link>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {post.views} views
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 italic text-center">No recent activity.</p>
            ) : (
              recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    <Link href={`/dashboard/posts/${activity.id}`} className="hover:text-indigo-600 transition-colors">
                      {activity.title}
                    </Link>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={activity.status === "PUBLISHED" ? "published" : "draft"}>
                      {activity.status}
                    </Badge>
                    <span className="text-xs font-semibold text-gray-700">
                      {timeAgo(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      </div>
    </div>
  )
}