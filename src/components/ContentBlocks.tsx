// src/components/ContentBlocks.tsx
import React from "react";
import Image from "next/image";

/** Supports:
 *  1) string (paragraphs separated by blank lines)
 *  2) Contentful Rich Text document (nodeType === 'document')
 *  3) simple POC block array
 */

// ---------- Contentful Rich Text ----------
type CFNode = {
  nodeType: string;
  content?: CFNode[];
  value?: string;
  data?: any;
};

function el(tag: string, key: React.Key, children?: React.ReactNode, props?: Record<string, any>) {
  return React.createElement(tag, { key, ...(props || {}) }, children);
}

function renderCF(node: CFNode, key: number): React.ReactNode {
  switch (node.nodeType) {
    case "document":
      return <>{node.content?.map((n, i) => renderCF(n, i))}</>;
    case "paragraph":
      return el("p", key, node.content?.map((n, i) => renderCF(n, i)));
    case "heading-1":
    case "heading-2":
    case "heading-3":
    case "heading-4":
    case "heading-5":
    case "heading-6": {
      const level = Number(node.nodeType.split("-")[1] ?? 2);
      const tag = `h${Math.min(6, Math.max(1, level))}`;
      return el(tag, key, node.content?.map((n, i) => renderCF(n, i)));
    }
    case "unordered-list":
      return el("ul", key, node.content?.map((n, i) => renderCF(n, i)));
    case "ordered-list":
      return el("ol", key, node.content?.map((n, i) => renderCF(n, i)));
    case "list-item":
      return el("li", key, node.content?.map((n, i) => renderCF(n, i)));
    case "blockquote":
      return el("blockquote", key, node.content?.map((n, i) => renderCF(n, i)));
    case "hyperlink":
      return el(
        "a",
        key,
        node.content?.map((n, i) => renderCF(n, i)),
        { href: node.data?.uri, target: "_blank", rel: "noreferrer" }
      );
    case "text":
      return node.value || null;
    default:
      return null;
  }
}

// ---------- Your simple POC blocks ----------
type Block =
  | { _type: "paragraph"; text: string }
  | { _type: "heading"; level?: 2 | 3 | 4 | 5 | 6; text: string }
  | { _type: "image"; src: string; alt?: string; width?: number; height?: number }
  | { _type: "quote"; text: string; cite?: string }
  | { _type: "list"; style?: "bullet" | "number"; items: string[] };

export default function ContentBlocks({ body }: { body?: any }) {
  if (!body) return null;

  // 1) Contentful Rich Text document
  if (typeof body === "object" && body?.nodeType === "document") {
    return <div className="prose max-w-none">{renderCF(body as CFNode, 0)}</div>;
  }

  // 2) Simple string paragraphs
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

  // 3) Your earlier POC blocks
  const blocks: Block[] = Array.isArray(body) ? body : body?.blocks ?? [];
  return (
    <div className="prose max-w-none">
      {blocks.map((b, i) => {
        switch (b._type) {
          case "heading": {
            const L = Math.min(6, Math.max(2, b.level ?? 2));
            const tag = `h${L}`;
            return el(tag, i, b.text);
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
