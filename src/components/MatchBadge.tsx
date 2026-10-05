import { matchStrength, scorePercent } from "@/lib/vector";

const LABELS = { strong: "Strong match", good: "Good match", weak: "Weak match" } as const;

export function MatchBadge({ score }: { score: number }) {
  const strength = matchStrength(score);
  const pct = scorePercent(score);
  return (
    <span className="score" title={`Cosine similarity ${score.toFixed(3)}`}>
      <span className={`badge badge-${strength}`}>{LABELS[strength]}</span>
      <span className="score-bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
      <span>{pct}%</span>
    </span>
  );
}
