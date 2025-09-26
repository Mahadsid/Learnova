"use client";

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Menubar } from './Menubar';
import TextAlign from "@tiptap/extension-text-align"

export function RichTextEditor({ field }: {field : any}) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        editorProps: {
            attributes: {
                class: "min-h-[300] p-4 focus: outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
            }
        },
        immediatelyRender: false, //for console error: tiptap error: SSR has been detected, please set `immediatelyRender` explicitly to false to avoid hydration mismatches. 
        onUpdate: ({ editor }) => {
            field.onChange(JSON.stringify(editor.getJSON()));
        },
        content: field.value ? JSON.parse(field.value) : '<p>Description 📝<p/>'
    });
    return (
        <div className='border w-full border-input rounded-lg overflow-hidden dark:bg-input/30'>
            <Menubar editor={editor} />
            <EditorContent editor={editor}/>
        </div>
    )
}