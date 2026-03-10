import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename to prevent issues
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `${uniqueSuffix}-${originalName}`;

        const uploadDir = path.join(process.cwd(), "public", "uploads");

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Ignore if exists
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const url = `/uploads/${filename}`;

        // Create Notification
        await prisma.notification.create({
            data: {
                userId: session.user.id,
                message: `Image "${file.name}" uploaded`,
            },
        });

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}
