import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function UserProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      posts: {
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const posts = user.posts;
  const publishedPosts = posts.filter((p) => p.status === "PUBLISHED");
  const drafts = posts.filter((p) => p.status === "DRAFT");

  // Heatmap data logic (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);

  const heatmapData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    // Activity: count posts created or updated on this day
    const activityCount = posts.filter((p) => {
      const createdStr = p.createdAt.toISOString().split("T")[0];
      const updatedStr = p.updatedAt.toISOString().split("T")[0];
      return createdStr === dateStr || updatedStr === dateStr;
    }).length;

    return { date: dateStr, count: activityCount };
  });

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-gray-100";
    if (count === 1) return "bg-emerald-100";
    if (count === 2) return "bg-emerald-300";
    if (count === 3) return "bg-emerald-500";
    return "bg-emerald-700";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Profile Header */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verified Account
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics & Heatmap */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <span className="text-2xl font-bold text-gray-900">{posts.length}</span>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Posts</p>
            </Card>
            <Card className="p-4 text-center">
              <span className="text-2xl font-bold text-emerald-600">{publishedPosts.length}</span>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Published</p>
            </Card>
            <Card className="p-4 text-center">
              <span className="text-2xl font-bold text-orange-500">{drafts.length}</span>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Drafts</p>
            </Card>
          </div>

          {/* Contribution Heatmap */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Activity Dashboard (Last 30 Days)
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {heatmapData.map((day) => (
                <div
                  key={day.date}
                  title={`${day.count} activities on ${day.date}`}
                  className={`w-4 h-4 rounded-sm transition-colors duration-200 ${getIntensity(day.count)} cursor-help hover:ring-2 hover:ring-emerald-300 ring-offset-1`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-100" />
                  <div className="w-3 h-3 rounded-sm bg-emerald-100" />
                  <div className="w-3 h-3 rounded-sm bg-emerald-300" />
                  <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <div className="w-3 h-3 rounded-sm bg-emerald-700" />
                </div>
                <span>More</span>
              </div>
              <span className="hidden sm:inline">Active contributions in the last month</span>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-start gap-4">
                  <div className={`mt-1.5 w-2 h-2 rounded-full ${post.status === "PUBLISHED" ? "bg-emerald-500" : "bg-orange-400"}`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{post.status === "PUBLISHED" ? "Published" : "Edited"}</span>{" "}
                      <Link href={`/dashboard/posts/${post.id}`} className="hover:text-indigo-600 font-medium">
                        "{post.title}"
                      </Link>
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(post.updatedAt).toLocaleDateString()} at {new Date(post.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <p className="text-center py-4 text-sm text-gray-400 italic">No recent activity found.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Your Posts */}
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-gray-900 px-1">Your Posts</h2>
          <div className="space-y-3">
            {posts.slice(0, 10).map((post) => (
              <Link
                key={post.id}
                href={`/dashboard/posts/${post.id}`}
                className="block group"
              >
                <Card className="p-4 hover:border-indigo-200 transition-colors group-hover:shadow-md border-transparent hover:bg-indigo-50/10">
                  <h3 className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {post.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      post.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-500"
                    }`}>
                      {post.status}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium italic">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
            {posts.length > 10 && (
              <Link
                href="/dashboard/posts"
                className="w-full inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2.5 text-xs"
              >
                View All Posts
              </Link>
            )}
            {posts.length === 0 && (
              <Card className="p-8 text-center border-dashed">
                <p className="text-sm text-gray-400">You haven't written any posts yet.</p>
                <Link
                  href="/dashboard/posts/new"
                  className="mt-4 inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-sm hover:shadow px-3 py-1.5 text-sm"
                >
                  Start Writing
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
