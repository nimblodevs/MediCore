import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ShieldCheck, Users } from "lucide-react";
import { getAllPatients } from "../../services/patientApi";

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start gap-3">
      <span
        className={[
          "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm",
          colorClass,
        ].join(" ")}
      >
        <Icon size={20} />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  </div>
);

const PatientList = () => {
  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ["patients"],
    queryFn: getAllPatients,
  });

  const totals = useMemo(
    () => ({
      total: patients.length,
      active: patients.filter((patient) => patient.status === "Active").length,
      suspended: patients.filter((patient) => patient.status !== "Active").length,
    }),
    [patients]
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
        Loading patient records...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 shadow-sm">
        Unable to load patient list. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Total patients"
          value={totals.total}
          icon={Users}
          colorClass="bg-cyan-600"
        />
        <StatCard
          label="Active patients"
          value={totals.active}
          icon={ShieldCheck}
          colorClass="bg-emerald-600"
        />
        <StatCard
          label="Suspended patients"
          value={totals.suspended}
          icon={CalendarDays}
          colorClass="bg-rose-600"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Patient registry</h2>
            <p className="mt-1 text-sm text-slate-500">
              All registered patients in the system.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {totals.total} records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-5 py-4 font-medium uppercase tracking-[0.2em] text-slate-500">
                  UHID
                </th>
                <th className="px-5 py-4 font-medium uppercase tracking-[0.2em] text-slate-500">
                  Patient ID
                </th>
                <th className="px-5 py-4 font-medium uppercase tracking-[0.2em] text-slate-500">
                  Name
                </th>
                <th className="px-5 py-4 font-medium uppercase tracking-[0.2em] text-slate-500">
                  Phone
                </th>
                <th className="px-5 py-4 font-medium uppercase tracking-[0.2em] text-slate-500">
                  DOB
                </th>
                <th className="px-5 py-4 font-medium uppercase tracking-[0.2em] text-slate-500">
                  Status
                </th>
                <th className="px-5 py-4 font-medium uppercase tracking-[0.2em] text-slate-500">
                  Last visit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {patients.map((patient) => (
                <tr key={patient.uhid} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {patient.uhid}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{patient.patientId}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {patient.firstName} {patient.middleName} {patient.lastName}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{patient.phoneNumber}</td>
                  <td className="px-5 py-4 text-slate-600">{patient.dob}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        patient.status === "Active"
                          ? "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                          : "inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
                      }
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{patient.lastVisitDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
