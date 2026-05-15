import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPatients } from "../../services/patientApi";

const PatientReportBilling = () => {
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getAllPatients,
  });

  // Mock billing summary derived from patient counts
  const summary = useMemo(
    () => ({
      totalPatients: patients.length,
      outstandingAccounts: patients.filter((p) => p.status !== "Active").length,
    }),
    [patients]
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center text-slate-600">
        Loading billing summary...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Billing & Invoices Report</h2>
        <p className="mt-1 text-sm text-slate-500">Financials, outstanding invoices and payment trends (sample).</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total patients</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.totalPatients}</p>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Outstanding accounts (approx.)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.outstandingAccounts}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientReportBilling;
