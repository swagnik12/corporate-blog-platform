import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"

export async function GET(req: Request) {
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "unknown"
    if (!rateLimit(ip)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    try {
        console.time("getPublishedPosts")
        const posts = await prisma.post.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                createdAt: true,
            },
        })
        console.timeEnd("getPublishedPosts")

        return NextResponse.json(posts)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}
