import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'

    return {
        rules: [
            {
                userAgent: "*",
                allow: [
                    "/",
                    "/blog"
                ],
                disallow: [
                    "/dashboard",
                    "/api",
                    "/login"
                ]
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`
    }
}
