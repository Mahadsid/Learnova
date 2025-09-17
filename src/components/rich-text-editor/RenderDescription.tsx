"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import { type JSONContent } from "@tiptap/react";
import StarterKit from '@tiptap/starter-kit';
import TextAlign from "@tiptap/extension-text-align";
import parse from "html-react-parser";


//since we store description using titap editor which save everithing in json in DB so, when displaying we need to convert it to html for rendering. thats why we are creating this function in rich-text-editor folder, this is used in (public)/courses/[slug]/page.tsx in displaying description aboyt course!
export function RenderDescription({json}: {json:JSONContent}) {
    const output = useMemo(() => {
        return generateHTML(json, [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ]);
    }, [json]);
    //since we get html from output it is quite dangerous to just return so we use a package https://www.npmjs.com/package/html-react-parser
    return (
        <div className="prose dark:prose-invert prose-li:marker:text-primary">{ parse(output) }</div>
    )
}