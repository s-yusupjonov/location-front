import { Button } from "antd";
import { strings } from "@/shared/strings";
import "./ErrorState.css";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <p className="error-state__message">{message ?? strings.monitoring.errorLoading}</p>
      {onRetry && (
        <Button onClick={onRetry} className="error-state__retry">
          {strings.monitoring.retry}
        </Button>
      )}
    </div>
  );
}
