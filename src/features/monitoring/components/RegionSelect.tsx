import { Select } from "antd";
import { strings } from "@/shared/strings";
import type { RegionDto } from "@/shared/types/api";

interface RegionSelectProps {
  regions: RegionDto[];
  selectedRegionId: number | null;
  onChange: (regionId: number) => void;
  isLoading: boolean;
}

export function RegionSelect({ regions, selectedRegionId, onChange, isLoading }: RegionSelectProps) {
  return (
    <Select
      value={selectedRegionId ?? undefined}
      onChange={onChange}
      placeholder={strings.monitoring.regionPlaceholder}
      loading={isLoading}
      style={{ width: "100%" }}
      size="large"
      options={regions.map((region) => ({ value: region.id, label: region.name }))}
    />
  );
}
