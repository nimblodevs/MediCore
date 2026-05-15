import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPatients } from "../../services/patientApi";

const PatientReportSummary = () => {
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getAllPatients,
  });

  const totals = useMemo(
    () => ({
      total: patients.length,
      active: patients.filter((p) => p.status === "Active").length,
      suspended: patients.filter((p) => p.status !== "Active").length,
    }),
    [patients]
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center text-slate-600">
        Loading patient summary...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Patient Summary Report</h2>
        <p className="mt-1 text-sm text-slate-500">High-level patient metrics and summary.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total patients</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totals.total}</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totals.active}</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Suspended</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totals.suspended}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientReportSummary;
