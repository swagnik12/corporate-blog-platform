"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate, calculateReadingTime, extractContent, stripHtml } from "@/lib/blog-utils";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get("q") || "";

    const [searchInput, setSearchInput] = useState(query);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            setLoading(true);
            fetch(`/api/search?q=${encodeURIComponent(query)}`)
                .then((res) => res.json())
                .then((data) => {
                    setResults(data);
                })
                .finally(() => setLoading(false));
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-8">
                Search the Blog
            </h1>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3 mb-16">
                <Input
                    type="text"
                    placeholder="Search for articles, news, or insights..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1 text-lg py-6"
                />
                <Button type="submit" size="lg" className="px-8">
                    Search
                </Button>
            </form>

            <div className="text-left">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-6">
                        <p className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-widest">
                            Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
                        </p>
                        <div className="grid gap-6">
                            {results.map((post) => {
                                const readingTime = calculateReadingTime(stripHtml(extractContent(post.content)));
                                return (
                                    <Link href={`/blog/${post.slug}`} key={post.id} className="block group">
                                        <Card className="p-6 md:p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-gray-100 bg-white">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight mb-2">
                                                        {post.title}
                                                    </h2>
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                                                        <span>•</span>
                                                        <span>{readingTime} min read</span>
                                                    </div>
                                                </div>
                                                <Button variant="secondary" size="sm" className="w-fit self-start md:self-center shrink-0">
                                                    Read Article
                                                </Button>
                                            </div>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ) : query && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm px-6">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-900 text-xl font-bold mb-2">No results found</p>
                        <p className="text-gray-500 text-sm">We couldn&apos;t find any articles matching &quot;{query}&quot;. Try a different keyword.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <main className="min-h-screen bg-gray-50 pt-16">
            <Suspense fallback={
                <div className="flex items-center justify-center p-20">
                    <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            }>
                <SearchContent />
            </Suspense>
        </main>
    );
}
