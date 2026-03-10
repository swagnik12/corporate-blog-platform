import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'

    // Fetch all published posts
    const posts = await prisma.post.findMany({
        where: {
            status: 'PUBLISHED',
        },
        select: {
            slug: true,
            updatedAt: true,
            publishedAt: true,
        },
    })

    const postUrls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.publishedAt || post.updatedAt,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
        },
        ...postUrls,
    ]
}
