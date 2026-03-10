import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Fetch the post
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 2. Verify ownership
    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You are not the author of this post" },
        { status: 403 }
      );
    }

    // 3. Validate required fields
    if (!post.title || !post.slug || !post.content) {
      return NextResponse.json(
        { error: "Missing required fields (title, slug, or content)" },
        { status: 400 }
      );
    }

    // 4. Update status to PUBLISHED
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    // 5. Create Notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        message: `Post "${post.title}" has been published`,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Publish Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
