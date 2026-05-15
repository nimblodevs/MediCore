import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPatients } from "../../services/patientApi";

const PatientReportLab = () => {
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getAllPatients,
  });

  const byStatus = useMemo(
    () => ({
      active: patients.filter((p) => p.status === "Active").length,
      suspended: patients.filter((p) => p.status !== "Active").length,
    }),
    [patients]
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center text-slate-600">
        Loading laboratory report...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Laboratory Report</h2>
        <p className="mt-1 text-sm text-slate-500">Lab requests, results distribution and turnaround times (sample).</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active patients</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{byStatus.active}</p>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Suspended patients</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{byStatus.suspended}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientReportLab;
