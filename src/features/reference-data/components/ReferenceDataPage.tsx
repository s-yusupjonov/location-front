import { useState } from "react";
import { Segmented } from "antd";
import { strings } from "@/shared/strings";
import { PageHeader } from "@/shared/components/PageHeader";
import { RegionsSection } from "./RegionsSection";
import { DistrictsSection } from "./DistrictsSection";
import { DepartmentsSection } from "./DepartmentsSection";
import { PositionsSection } from "./PositionsSection";
import "./ReferenceDataPage.css";

type ReferenceTab = "regions" | "districts" | "departments" | "positions";

const tabOptions = [
  { value: "regions", label: strings.referenceData.tabRegions },
  { value: "districts", label: strings.referenceData.tabDistricts },
  { value: "departments", label: strings.referenceData.tabDepartments },
  { value: "positions", label: strings.referenceData.tabPositions },
];

export function ReferenceDataPage() {
  const [activeTab, setActiveTab] = useState<ReferenceTab>("regions");

  return (
    <div className="reference-page">
      <PageHeader
        title={strings.referenceData.pageTitle}
        subtitle={strings.referenceData.pageSubtitle}
      />

      <div className="reference-page__card">
        <Segmented
          className="reference-page__tabs"
          value={activeTab}
          options={tabOptions}
          onChange={(value) => setActiveTab(value as ReferenceTab)}
        />

        <div className="reference-page__body">
          {activeTab === "regions" && <RegionsSection />}
          {activeTab === "districts" && <DistrictsSection />}
          {activeTab === "departments" && <DepartmentsSection />}
          {activeTab === "positions" && <PositionsSection />}
        </div>
      </div>
    </div>
  );
}
