import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = { params: Promise<{ id: string }> }

// ─── GET /api/posts/[id] ─────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: RouteContext) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const post = await prisma.post.findUnique({ where: { id } })

        if (!post || post.authorId !== session.user.id) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

// ─── PATCH /api/posts/[id] ───────────────────────────────────────────────────

export async function PATCH(req: Request, { params }: RouteContext) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const existing = await prisma.post.findUnique({ where: { id } })

        if (!existing || existing.authorId !== session.user.id) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        const body = await req.json()
        const { title, content, slug, status, categoryId, bannerImage } = body

        // Stamp publishedAt when first publishing
        const publishedAt =
            status === "PUBLISHED" && existing.status !== "PUBLISHED"
                ? new Date()
                : undefined

        // Run post update + category replacement in a transaction
        const [updated] = await prisma.$transaction([
            prisma.post.update({
                where: { id },
                data: {
                    ...(title !== undefined && { title }),
                    ...(content !== undefined && { content }),
                    ...(slug !== undefined && { slug }),
                    ...(status !== undefined && { status }),
                    ...(publishedAt && { publishedAt }),
                    ...(bannerImage !== undefined && { bannerImage }),
                },
            }),
            // If a categoryId was provided, replace the category association
            ...(categoryId !== undefined
                ? [
                    // Remove all existing category links for this post
                    prisma.postCategory.deleteMany({ where: { postId: id } }),
                    // Re-create with the new category
                    prisma.postCategory.create({
                        data: {
                            postId: id,
                            categoryId,
                        },
                    }),
                ]
                : []),
        ])

        return NextResponse.json(updated)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

// ─── DELETE /api/posts/[id] ──────────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: RouteContext) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const existing = await prisma.post.findUnique({ where: { id } })

        if (!existing || existing.authorId !== session.user.id) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        await prisma.post.delete({ where: { id } })

        return NextResponse.json({ message: "Post deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
