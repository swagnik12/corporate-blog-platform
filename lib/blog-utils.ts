export function extractContent(content: unknown): string {
    if (typeof content === "string") return content
    if (content && typeof content === "object" && "text" in content) {
        return (content as { text?: string }).text ?? ""
    }
    return ""
}

export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
}

export function calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}
