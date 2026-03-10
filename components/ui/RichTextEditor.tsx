"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import { useCallback, useEffect } from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const activeBtnClass = "bg-indigo-100 text-indigo-700 font-bold";
    const inactiveBtnClass = "text-gray-500 hover:text-gray-900 hover:bg-gray-100";
    const baseBtnClass = "p-2 rounded-lg transition-colors text-sm px-3";

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50/50 rounded-t-xl">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`${baseBtnClass} ${editor.isActive('bold') ? activeBtnClass : inactiveBtnClass} font-serif font-bold`}
                title="Bold"
            >
                B
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`${baseBtnClass} ${editor.isActive('italic') ? activeBtnClass : inactiveBtnClass} font-serif italic`}
                title="Italic"
            >
                I
            </button>

            <div className="w-px h-5 bg-gray-200 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`${baseBtnClass} ${editor.isActive('heading', { level: 1 }) ? activeBtnClass : inactiveBtnClass} font-bold`}
            >
                H1
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`${baseBtnClass} ${editor.isActive('heading', { level: 2 }) ? activeBtnClass : inactiveBtnClass} font-bold`}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`${baseBtnClass} ${editor.isActive('heading', { level: 3 }) ? activeBtnClass : inactiveBtnClass} font-bold`}
            >
                H3
            </button>

            <div className="w-px h-5 bg-gray-200 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`${baseBtnClass} ${editor.isActive('bulletList') ? activeBtnClass : inactiveBtnClass}`}
                title="Bullet List"
            >
                • List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`${baseBtnClass} ${editor.isActive('orderedList') ? activeBtnClass : inactiveBtnClass}`}
                title="Ordered List"
            >
                1. List
            </button>

            <div className="w-px h-5 bg-gray-200 mx-1"></div>

            <button
                type="button"
                onClick={setLink}
                className={`${baseBtnClass} ${editor.isActive('link') ? activeBtnClass : inactiveBtnClass}`}
                title="Link"
            >
                🔗
            </button>
            {editor.isActive('link') && (
                <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    className={`${baseBtnClass} ${inactiveBtnClass}`}
                >
                    <s>🔗</s>
                </button>
            )}
        </div>
    );
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-indigo-600 underline hover:text-indigo-800 transition-colors cursor-pointer',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[400px]',
            },
        },
    });

    // Update editor content when value from props changes externally (e.g. from fetch)
    useEffect(() => {
        if (editor && value && editor.getHTML() !== value) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all bg-white shadow-sm">
            <MenuBar editor={editor} />
            <div className="p-4 cursor-text bg-white overflow-y-auto max-h-[600px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
