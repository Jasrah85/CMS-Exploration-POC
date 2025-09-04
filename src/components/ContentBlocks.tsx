import React from "react";
import Image from "next/image";

/** Generic, CMS-agnostic lightweight renderer for POC use.
 * Accepts either:
 *   1) string (paragraphs separated by blank lines), OR
 *   2) array of blocks with _type: 'paragraph'|'heading'|'image'|'quote'|'list'
 */
type Block =
  | { _type: "paragraph"; text: string }
  | { _type: "heading"; level?: 2 | 3 | 4 | 5 | 6; text: string }
  | { _type: "image"; src: string; alt?: string; width?: number; height?: number }
  | { _type: "quote"; text: string; cite?: string }
  | { _type: "list"; style?: "bullet" | "number"; items: string[] };

export default function ContentBlocks({ body }: { body?: any }) {
  if (!body) return null;

  if (typeof body === "string") {
    const paras = body.split(/\n\s*\n/).filter(Boolean);
    return (
      <div className="prose max-w-none">
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }

  const blocks: Block[] = Array.isArray(body) ? body : body?.blocks ?? [];
  return (
    <div className="prose max-w-none">
      {blocks.map((b, i) => {
        switch (b._type) {
            case "heading": {
            const level = Math.min(6, Math.max(2, b.level ?? 2)) as 2 | 3 | 4 | 5 | 6;
            const tag = ({ 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const)[level];
            return React.createElement(tag, { key: i }, b.text);
            }
          case "image":
            return (
              <figure key={i}>
                <Image
                  src={b.src}
                  alt={b.alt || ""}
                  width={b.width || 800}
                  height={b.height || 450}
                  className="rounded-xl"
                />
                {b.alt && <figcaption className="text-sm text-gray-500">{b.alt}</figcaption>}
              </figure>
            );
          case "quote":
            return (
              <blockquote key={i}>
                <p>{b.text}</p>
                {b.cite && <cite>— {b.cite}</cite>}
              </blockquote>
            );
          case "list":
            return b.style === "number" ? (
              <ol key={i}>{b.items.map((t, j) => <li key={j}>{t}</li>)}</ol>
            ) : (
              <ul key={i}>{b.items.map((t, j) => <li key={j}>{t}</li>)}</ul>
            );
          default:
            return <p key={i}>{(b as any).text}</p>;
        }
      })}
    </div>
  );
}
