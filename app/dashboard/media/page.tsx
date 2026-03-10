import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function MediaLibraryPage() {
  const postsWithImages = await prisma.post.findMany({
    where: {
      bannerImage: {
        not: null,
      },
    },
    select: {
      id: true,
      title: true,
      bannerImage: true,
      slug: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Media Library</h1>
          <p className="mt-2 text-gray-500">
            View and manage all cover images used across your blog posts.
          </p>
        </div>
      </div>

      {postsWithImages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-gray-50 p-6">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No media found</h3>
          <p className="mt-2 text-gray-500">
            Upload images to your posts to see them here.
          </p>
          <Link
            href="/dashboard/posts/new"
            className="mt-6 inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-sm hover:shadow px-4 py-2.5 text-sm"
          >
            Create New Post
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {postsWithImages.map((post) => (
            <Card key={post.id} className="overflow-hidden group">
              <Link href={`/dashboard/posts/${post.id}`} className="block relative aspect-video bg-gray-100 overflow-hidden">
                {post.bannerImage && (
                  <Image
                    src={post.bannerImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </Link>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-3" title={post.title}>
                  {post.title}
                </h3>
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/dashboard/posts/${post.id}`}
                    className="w-full inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs border border-gray-200"
                  >
                    Edit Post
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
