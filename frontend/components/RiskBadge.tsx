const STYLES: Record<string, string> = {
  Low: "bg-secondary-container text-on-secondary-container",
  Moderate: "bg-tertiary-container/20 text-tertiary",
  High: "bg-error-container text-on-error-container",
  Emergency: "bg-error text-on-error",
};

export default function RiskBadge({ level }: { level: string }) {
  return <span className={`pill ${STYLES[level] || "bg-surface-container text-on-surface-variant"}`}>{level} risk</span>;
}
