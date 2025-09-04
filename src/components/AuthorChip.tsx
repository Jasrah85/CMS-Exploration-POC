import Image from "next/image";
import type { Author } from "@/lib/models";

export default function AuthorChip({ author, size = 36 }: { author?: Author; size?: number }) {
  if (!author) return null;
  const initials = author.name
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        {author.avatar?.url ? (
          <Image
            src={author.avatar.url}
            alt={author.avatar.alt || author.name}
            fill
            className="rounded-full object-cover"
            sizes={`${size}px`}
          />
        ) : (
          <div
            className="grid place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700"
            style={{ width: size, height: size }}
            aria-hidden
          >
            {initials}
          </div>
        )}
      </div>
      <div className="leading-tight">
        <span className="block text-sm font-medium">{author.name}</span>
        {author.title && <span className="block text-xs text-gray-500">{author.title}</span>}
      </div>
    </div>
  );
}
