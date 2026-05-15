import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPatients } from "../../services/patientApi";

const PatientReportVisits = () => {
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getAllPatients,
  });

  const recentVisits = useMemo(
    () => patients.filter((p) => p.lastVisitDate && p.lastVisitDate.includes("2026")),
    [patients]
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center text-slate-600">
        Loading visits...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Patient Visits Report</h2>
        <p className="mt-1 text-sm text-slate-500">Visits over time, frequent reasons and trends.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4">
          <p className="text-sm text-slate-600">Patients with visits in 2026: <strong>{recentVisits.length}</strong></p>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">UHID</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Last visit</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.slice(0, 10).map((p) => (
                  <tr key={p.uhid} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold">{p.uhid}</td>
                    <td className="px-3 py-2">{p.firstName} {p.middleName} {p.lastName}</td>
                    <td className="px-3 py-2">{p.lastVisitDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientReportVisits;
