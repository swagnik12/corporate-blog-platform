import Link from "next/link";

interface Heading {
    id: string;
    text: string;
    level: number; // 2 for H2, 3 for H3
}

interface TableOfContentsProps {
    headings: Heading[];
}

export const TableOfContents = ({ headings }: TableOfContentsProps) => {
    if (headings.length < 2) return null;

    return (
        <nav className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 mb-12">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
                Contents
            </h2>
            <ul className="space-y-3">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        style={{ paddingLeft: heading.level === 3 ? "1.5rem" : "0" }}
                    >
                        <Link
                            href={`#${heading.id}`}
                            className="text-gray-600 hover:text-indigo-600 transition-colors text-[15px] flex items-start gap-2 group"
                        >
                            <span className="text-indigo-400 group-hover:text-indigo-600 transition-colors mt-1">•</span>
                            <span className="leading-tight">{heading.text}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
