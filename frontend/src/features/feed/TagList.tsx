import React from "react";

interface Props {
  tags: string[];
}

export default function TagList({ tags }: Props) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">

      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[10px] font-bold uppercase bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2 py-1 rounded-md tracking-wider"
        >
          #{tag}
        </span>
      ))}

    </div>
  );
}
