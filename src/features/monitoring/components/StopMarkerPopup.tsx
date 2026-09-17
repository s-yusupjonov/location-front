import { Button } from "antd";
import { strings } from "@/shared/strings";
import type { StopDto } from "@/shared/types/api";
import "./StopMarkerPopup.css";

interface StopMarkerPopupProps {
  stop: StopDto;
  onClose: () => void;
}

function formatTime(value: string | null): string {
  if (!value) return strings.stopPopup.stillHere;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} ${strings.common.minutes}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0
    ? `${hours} ${strings.common.hours} ${rest} ${strings.common.minutes}`
    : `${hours} ${strings.common.hours}`;
}

export function StopMarkerPopup({ stop, onClose }: StopMarkerPopupProps) {
  return (
    <div className="stop-popup" role="dialog" aria-label={strings.stopPopup.address}>
      <div className="stop-popup__header">
        <span className="stop-popup__title">{strings.stopPopup.address}</span>
        <Button type="text" size="small" onClick={onClose} className="stop-popup__close">
          {strings.common.close}
        </Button>
      </div>
      <p className="stop-popup__address">{stop.address ?? strings.stopPopup.addressUnknown}</p>
      <dl className="stop-popup__rows">
        <div className="stop-popup__row">
          <dt>{strings.stopPopup.arrival}</dt>
          <dd>{formatTime(stop.arrivalTime)}</dd>
        </div>
        <div className="stop-popup__row">
          <dt>{strings.stopPopup.departure}</dt>
          <dd>{formatTime(stop.departureTime)}</dd>
        </div>
        <div className="stop-popup__row">
          <dt>{strings.stopPopup.duration}</dt>
          <dd>{formatDuration(stop.durationMinutes)}</dd>
        </div>
      </dl>
    </div>
  );
}
