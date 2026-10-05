import { collectionColor } from "@/lib/collections";
import { initials } from "@/lib/format";

/**
 * Generated 16:9 thumbnail for a document, styled like a video thumbnail:
 * collection colour, a page illustration and a corner badge.
 */
export function Thumb({
  title,
  collection,
  badge,
  progress,
  muted = false,
}: {
  title: string;
  collection: string;
  badge?: string;
  /** 0-1: where the matched page sits in the document. */
  progress?: number;
  muted?: boolean;
}) {
  const color = muted ? "#8a8a8a" : collectionColor(collection);
  const label = initials(title, 3);
  return (
    <span className="thumb" data-testid="thumb">
      <svg viewBox="0 0 320 180" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="180" fill={color} />
        <circle cx="290" cy="20" r="70" fill="#fff" opacity="0.08" />
        <circle cx="20" cy="170" r="50" fill="#000" opacity="0.08" />
        <g transform="translate(118 22) rotate(-4)">
          <rect width="96" height="128" rx="6" fill="#fff" opacity="0.25" transform="translate(10 6)" />
          <rect width="96" height="128" rx="6" fill="#fff" />
          <rect x="12" y="14" width="50" height="8" rx="4" fill={color} />
          <rect x="12" y="32" width="72" height="5" rx="2.5" fill="#d6d6d6" />
          <rect x="12" y="44" width="64" height="5" rx="2.5" fill="#d6d6d6" />
          <rect x="12" y="56" width="70" height="5" rx="2.5" fill="#d6d6d6" />
          <rect x="12" y="68" width="48" height="5" rx="2.5" fill="#d6d6d6" />
          <text x="12" y="112" fontFamily="Roboto, Arial, sans-serif" fontWeight="700" fontSize="22" fill={color}>
            {label}
          </text>
        </g>
        <text x="16" y="30" fontFamily="Roboto, Arial, sans-serif" fontWeight="700" fontSize="13" fill="#fff" opacity="0.9">
          PDF
        </text>
      </svg>
      {badge && <span className="thumb-badge">{badge}</span>}
      {progress !== undefined && (
        <span className="thumb-progress">
          <span style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }} />
        </span>
      )}
    </span>
  );
}
