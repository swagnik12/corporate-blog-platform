import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const post = await prisma.post.findFirst({
            where: {
                slug,
                status: "PUBLISHED",
            },
            select: {
                id: true,
                title: true,
                content: true,
                slug: true,
                createdAt: true,
            },
        })

        if (!post) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
