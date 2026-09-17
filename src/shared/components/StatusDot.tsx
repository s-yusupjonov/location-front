import "./StatusDot.css";

interface StatusDotProps {
  isOnline: boolean;
}

export function StatusDot({ isOnline }: StatusDotProps) {
  return (
    <span
      className={`status-dot ${isOnline ? "status-dot--online" : "status-dot--offline"}`}
      aria-hidden="true"
    />
  );
}
