import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { rateLimit } from "@/lib/rateLimit"

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "unknown"
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""   // "PUBLISHED" | "DRAFT" | ""
    const dateRange = searchParams.get("date") || ""   // "7" | "30" | "90" | ""
    const category = searchParams.get("category") || ""   // category slug
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10))

    // ── Build composite where clause ─────────────────────────────────────
    const where: Prisma.PostWhereInput = {
      authorId: session.user.id,

      // Search by title or slug
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }),

      // Status filter
      ...(status && { status: status as "DRAFT" | "PUBLISHED" }),

      // Date range filter
      ...(dateRange && {
        createdAt: {
          gte: new Date(Date.now() - parseInt(dateRange, 10) * 24 * 60 * 60 * 1000),
        },
      }),

      // Category filter via PostCategory join
      ...(category && {
        categories: {
          some: {
            category: { slug: category },
          },
        },
      }),
    }

    console.time("getUserPosts")
    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          slug: true,
          bannerImage: true,
          categories: {
            select: {
              category: {
                select: { id: true, name: true, slug: true }
              }
            }
          }
        },
      }),
      prisma.post.count({ where }),
    ])
    console.timeEnd("getUserPosts")

    return NextResponse.json({
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "unknown"
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, content, categoryId, bannerImage } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")

    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        authorId: session.user.id,
        status: "DRAFT",
        ...(bannerImage && { bannerImage }),
        // ── Automatically link category if provided ──────────────────
        ...(categoryId && {
          categories: {
            create: {
              category: { connect: { id: categoryId } },
            },
          },
        }),
      },
    })

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        message: `Draft post "${title}" created`,
      },
    });

    return NextResponse.json(post, { status: 201 })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}