import { useState } from "react";
import MonitorClassMembersTab from "./MonitorClassMembersTab";
import MonitorEvidenceReviewTab from "./MonitorEvidenceReviewTab";
import MonitorScoreManagementTab from "./MonitorScoreManagementTab";

const MONITOR_TABS = [
    { key: "members", label: "Thành viên lớp" },
    { key: "evidence", label: "Duyệt minh chứng" },
    { key: "evaluation", label: "Quản lý phiếu điểm" },
];

export default function MonitorClass() {
    const [activeTab, setActiveTab] = useState("members");

    return (
        <section className="space-y-4">
            <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {MONITOR_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key
                                    ? "bg-primary text-white"
                                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "members" ? <MonitorClassMembersTab /> : null}
            {activeTab === "evidence" ? <MonitorEvidenceReviewTab /> : null}
            {activeTab === "evaluation" ? <MonitorScoreManagementTab /> : null}
        </section>
    );
}
