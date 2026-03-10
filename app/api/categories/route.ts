import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public route — no auth needed, categories are public metadata
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            select: { id: true, name: true, slug: true },
            orderBy: { name: "asc" },
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
