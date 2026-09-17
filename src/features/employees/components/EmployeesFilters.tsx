import { Button, Input, Select } from "antd";
import { strings } from "@/shared/strings";
import type { DepartmentDto, DistrictDto, RegionDto } from "@/shared/types/api";
import "./EmployeesFilters.css";

interface EmployeesFiltersProps {
  regions: RegionDto[];
  districts: DistrictDto[];
  departments: DepartmentDto[];
  regionId: number | null;
  districtId: number | null;
  departmentId: number | null;
  searchQuery: string;
  isRegionsLoading: boolean;
  isDistrictsLoading: boolean;
  isDepartmentsLoading: boolean;
  onRegionChange: (value: number | null) => void;
  onDistrictChange: (value: number | null) => void;
  onDepartmentChange: (value: number | null) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export function EmployeesFilters({
  regions,
  districts,
  departments,
  regionId,
  districtId,
  departmentId,
  searchQuery,
  isRegionsLoading,
  isDistrictsLoading,
  isDepartmentsLoading,
  onRegionChange,
  onDistrictChange,
  onDepartmentChange,
  onSearchChange,
  onReset,
}: EmployeesFiltersProps) {
  return (
    <div className="employees-filters">
      <div className="employees-filters__field">
        <span className="employees-filters__label">{strings.employees.filtersRegion}</span>
        <Select
          value={regionId ?? undefined}
          onChange={(value: number | undefined) => onRegionChange(value ?? null)}
          placeholder={strings.employees.filtersRegionPlaceholder}
          loading={isRegionsLoading}
          allowClear
          showSearch
          optionFilterProp="label"
          options={regions.map((region) => ({ value: region.id, label: region.name }))}
        />
      </div>

      <div className="employees-filters__field">
        <span className="employees-filters__label">{strings.employees.filtersDistrict}</span>
        <Select
          value={districtId ?? undefined}
          onChange={(value: number | undefined) => onDistrictChange(value ?? null)}
          placeholder={
            regionId === null
              ? strings.employees.filtersDistrictDisabled
              : strings.employees.filtersDistrictPlaceholder
          }
          disabled={regionId === null}
          loading={isDistrictsLoading}
          allowClear
          showSearch
          optionFilterProp="label"
          options={districts.map((district) => ({ value: district.id, label: district.name }))}
        />
      </div>

      <div className="employees-filters__field">
        <span className="employees-filters__label">{strings.employees.filtersDepartment}</span>
        <Select
          value={departmentId ?? undefined}
          onChange={(value: number | undefined) => onDepartmentChange(value ?? null)}
          placeholder={strings.employees.filtersDepartmentPlaceholder}
          loading={isDepartmentsLoading}
          allowClear
          showSearch
          optionFilterProp="label"
          options={departments.map((department) => ({
            value: department.id,
            label: department.name,
          }))}
        />
      </div>

      <div className="employees-filters__field employees-filters__field--wide">
        <span className="employees-filters__label">{strings.employees.filtersSearch}</span>
        <Input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={strings.employees.filtersSearchPlaceholder}
          allowClear
        />
      </div>

      <Button className="employees-filters__reset" onClick={onReset}>
        {strings.employees.filtersReset}
      </Button>
    </div>
  );
}
