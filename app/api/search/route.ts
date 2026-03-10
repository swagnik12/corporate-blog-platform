import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"

export async function GET(req: Request) {
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "unknown"
    if (!rateLimit(ip)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const query = searchParams.get("q")

        if (!query) {
            return NextResponse.json([], { status: 200 })
        }

        console.time("searchPosts")
        const posts = await prisma.post.findMany({
            where: {
                status: "PUBLISHED",
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { excerpt: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                title: true,
                slug: true,
                publishedAt: true,
                createdAt: true,
                content: true,
                excerpt: true,
            },
            orderBy: {
                publishedAt: "desc",
            },
        })
        console.timeEnd("searchPosts")

        return NextResponse.json(posts)
    } catch (error) {
        console.error("SEARCH_ERROR", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
