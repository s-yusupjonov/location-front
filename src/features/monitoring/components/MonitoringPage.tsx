import { useCallback, useMemo, useState } from "react";
import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { strings } from "@/shared/strings";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { YandexMap } from "@/shared/map/YandexMap";
import { RegionSelect } from "./RegionSelect";
import { EmployeeList } from "./EmployeeList";
import { StopMarkerPopup } from "./StopMarkerPopup";
import { useRegions } from "@/features/monitoring/hooks/useRegions";
import { useEmployees } from "@/features/monitoring/hooks/useEmployees";
import { useEmployeesWithStatus } from "@/features/monitoring/hooks/useEmployeesWithStatus";
import { useEmployeeFuzzySearch } from "@/features/monitoring/hooks/useEmployeeFuzzySearch";
import { useEmployeeRoute } from "@/features/monitoring/hooks/useEmployeeRoute";
import { useEmployeeStops } from "@/features/monitoring/hooks/useEmployeeStops";
import { useLiveLocation } from "@/features/monitoring/hooks/useLiveLocation";
import type { StopDto } from "@/shared/types/api";
import "./MonitoringPage.css";

const DATE_FORMAT = "YYYY-MM-DD";

export function MonitoringPage() {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedStop, setSelectedStop] = useState<StopDto | null>(null);

  const regionsQuery = useRegions();
  const employeesQuery = useEmployees(selectedRegionId);
  const { employeesWithStatus } = useEmployeesWithStatus(employeesQuery.data);
  const filteredEmployees = useEmployeeFuzzySearch(employeesWithStatus, searchQuery);

  const dateString = selectedDate.format(DATE_FORMAT);
  const isToday = selectedDate.isSame(dayjs(), "day");

  const routeQuery = useEmployeeRoute(selectedEmployeeId, dateString);
  const stopsQuery = useEmployeeStops(selectedEmployeeId, dateString);
  const liveMarker = useLiveLocation(selectedEmployeeId, isToday);

  const selectedRegion = useMemo(
    () => regionsQuery.data?.find((region) => region.id === selectedRegionId) ?? null,
    [regionsQuery.data, selectedRegionId],
  );

  const regionCenter = useMemo<[number, number] | null>(() => {
    if (selectedRegion?.latitude !== undefined && selectedRegion?.longitude !== undefined) {
      return [selectedRegion.latitude, selectedRegion.longitude];
    }
    return null;
  }, [selectedRegion]);

  const handleRegionChange = useCallback((regionId: number) => {
    setSelectedRegionId(regionId);
    setSelectedEmployeeId(null);
    setSearchQuery("");
    setSelectedStop(null);
  }, []);

  const handleSelectEmployee = useCallback((employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setSelectedDate(dayjs());
    setSelectedStop(null);
  }, []);

  const handleDateChange = useCallback((value: Dayjs | null) => {
    if (value) {
      setSelectedDate(value);
      setSelectedStop(null);
    }
  }, []);

  return (
    <div className="monitoring-page">
      <aside className="monitoring-page__sidebar">
        <div className="monitoring-page__region">
          <label className="monitoring-page__label">{strings.monitoring.region}</label>
          <RegionSelect
            regions={regionsQuery.data ?? []}
            selectedRegionId={selectedRegionId}
            onChange={handleRegionChange}
            isLoading={regionsQuery.isLoading}
          />
          {regionsQuery.isError && (
            <ErrorState onRetry={() => regionsQuery.refetch()} />
          )}
        </div>

        {employeesQuery.isError ? (
          <ErrorState onRetry={() => employeesQuery.refetch()} />
        ) : (
          <EmployeeList
            employees={filteredEmployees}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedEmployeeId={selectedEmployeeId}
            onSelectEmployee={handleSelectEmployee}
            isRegionSelected={selectedRegionId !== null}
            isLoading={employeesQuery.isLoading}
            isEmpty={(employeesQuery.data?.length ?? 0) === 0 && !employeesQuery.isLoading}
            isSearchEmpty={
              (employeesQuery.data?.length ?? 0) > 0 && filteredEmployees.length === 0
            }
          />
        )}
      </aside>

      <section className="monitoring-page__map-area">
        {selectedEmployeeId !== null && (
          <div className="monitoring-page__date-bar">
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              format={DATE_FORMAT}
              allowClear={false}
              disabledDate={(date) => date.isAfter(dayjs(), "day")}
            />
            {isToday && (
              <span className="monitoring-page__live-badge">{strings.monitoring.live}</span>
            )}
          </div>
        )}

        <div className="monitoring-page__map-wrap">
          <YandexMap
            regionCenter={regionCenter}
            route={routeQuery.data}
            stops={stopsQuery.data}
            liveMarker={isToday ? liveMarker : null}
            onStopClick={setSelectedStop}
          />

          {selectedStop && (
            <StopMarkerPopup stop={selectedStop} onClose={() => setSelectedStop(null)} />
          )}

          {selectedEmployeeId === null && (
            <div className="monitoring-page__map-hint">
              <EmptyState message={strings.monitoring.selectEmployeeHint} />
            </div>
          )}

          {selectedEmployeeId !== null && routeQuery.isError && (
            <div className="monitoring-page__map-hint">
              <ErrorState onRetry={() => routeQuery.refetch()} />
            </div>
          )}

          {selectedEmployeeId !== null &&
            !routeQuery.isLoading &&
            !routeQuery.isError &&
            (routeQuery.data?.length ?? 0) === 0 && (
              <div className="monitoring-page__map-hint">
                <EmptyState message={strings.monitoring.noRoute} />
              </div>
            )}
        </div>
      </section>
    </div>
  );
}
