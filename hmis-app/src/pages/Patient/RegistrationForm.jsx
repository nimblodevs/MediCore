import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  ContactRound,
  FileText,
  IdCard,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  User,
  Users,
  UserRound,
} from "lucide-react";

import Input from "../../components/ui/Input";
import { getPatientByUhid, searchPatients } from "../../services/patientApi";
import {
  getCounties,
  getSubCounties,
  getWards,
} from "../../utils/kenyaLocations";

const fieldClasses =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-600/10";

const Section = ({ description, headerContent, children }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
    <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
      {headerContent ? <div className="mb-3">{headerContent}</div> : null}
      <p className="text-sm text-slate-600">{description}</p>
    </div>
    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {children}
    </div>
  </section>
);

const SelectField = ({
  id,
  label,
  required = false,
  children,
  value,
  onChange,
  disabled = false,
  leftIcon: Icon,
  containerClassName = "",
}) => (
  <div className={["w-full", containerClassName].join(" ")}>
    <label
      htmlFor={id}
      className="mb-1.5 block text-sm font-semibold text-slate-800"
    >
      {label}
      {required ? <span className="ml-0.5 text-rose-600">*</span> : null}
    </label>
    <div className="relative">
      {Icon ? (
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      ) : null}
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 ${
          Icon ? "pl-10" : ""
        } ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
      >
        {children}
      </select>
    </div>
  </div>
);

const TextareaField = ({
  id,
  label,
  placeholder,
  className = "",
  rows = 2,
  leftIcon: LeftIcon,
}) => (
  <div className={className}>
    <label
      htmlFor={id}
      className="mb-1.5 block text-sm font-semibold text-slate-800"
    >
      {label}
    </label>
    <div className="relative">
      {LeftIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-start pt-2.5 text-slate-400">
          <LeftIcon className="size-4" />
        </span>
      ) : null}
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        className={`${fieldClasses} min-h-16 resize-y py-2 ${
          LeftIcon ? "pl-9" : ""
        }`}
      />
    </div>
  </div>
);

const CommentField = ({ id }) => (
  <TextareaField
    id={id}
    label="Comments"
    placeholder="Add relevant notes or special considerations"
    className="sm:col-span-2 xl:col-span-2"
    leftIcon={FileText}
  />
);

const PatientRegistration = () => {
  const [activeTab, setActiveTab] = useState("Demography & Contact Details");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [patienttype, setPatientType] = useState("Kenyan");
  const [nationality, setNationality] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [idType, setIdType] = useState("National ID");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [isSuspended, setIsSuspended] = useState(false);
  const [sameAsNok, setSameAsNok] = useState(false);
  const [uihdNo, setUihdNo] = useState("");
  const [surname, setSurname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [nokSurname, setNokSurname] = useState("");
  const [nokFirstName, setNokFirstName] = useState("");
  const [nokOtherName, setNokOtherName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [alternateEmergencyPhone, setAlternateEmergencyPhone] = useState("");

  const sectionTabs = [
    "Demography & Contact Details",
    "NOK & Emergency Contact",
    "Administrative Details",
  ];
  const sectionTabIcons = {
    "Demography & Contact Details": IdCard,
    "NOK & Emergency Contact": Users,
    "Residence Details": MapPin,
    "Administrative Details": Building2,
  };
  const sectionDescriptions = {
    "Demography & Contact Details":
      "Capture statutory identity attributes and patient communication channels used for matching, outreach, and follow-up.",
    "NOK & Emergency Contact":
      "Record next of kin and emergency contacts for consent workflows, escalation paths, and urgent communication.",
    "Administrative Details":
      "Maintain registration metadata and account control details used for operational tracking and status management.",
  };

  const approximateAge = useMemo(() => {
    if (!dateOfBirth) return "";
    const birthDate = new Date(`${dateOfBirth}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return "";
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (today.getDate() < birthDate.getDate()) months -= 1;
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    years = Math.max(years, 0);
    months = Math.max(months, 0);
    return `${years} ${years === 1 ? "year" : "years"}, ${months} ${
      months === 1 ? "month" : "months"
    }`;
  }, [dateOfBirth]);

  const isKenyan = patienttype === "Kenyan";
  const identificationOptions = isKenyan
    ? ["National ID", "Military ID", "Birth Certificate", "Passport No."]
    : ["Alien ID", "Passport No.", "UNHCR Registration Number"];
  const documentNumberLabel =
    idType === "Passport No."
      ? "Passport No."
      : idType === "UNHCR Registration Number"
      ? "UNHCR Registration Number"
      : idType === "Birth Certificate"
      ? "Birth Certificate Number"
      : `${idType} Number`;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: searchResults = [] } = useQuery({
    queryKey: ["patient-search", debouncedSearchTerm],
    queryFn: () => searchPatients(debouncedSearchTerm),
    enabled: Boolean(debouncedSearchTerm.trim()),
  });

  const populatePatientToForm = (patient) => {
    const fullName = `${patient.firstName} ${patient.middleName} ${patient.lastName}`;
    setSearchTerm(`${patient.uhid} - ${fullName} - ${patient.phoneNumber}`);
    setUihdNo(patient.uhid);
    setSurname(patient.lastName);
    setFirstName(patient.firstName);
    setMiddleName(patient.middleName);
    setDateOfBirth(patient.dob);
    setPrimaryPhone(patient.phoneNumber);
    setShowSearchResults(false);
  };

  const uhidLookupMutation = useMutation({
    mutationFn: getPatientByUhid,
    onSuccess: (patient) => {
      if (patient) populatePatientToForm(patient);
    },
  });

  const sectionTabsContent = (
    <div className="flex flex-wrap gap-1.5">
      {sectionTabs.map((tab) => {
        const TabIcon = sectionTabIcons[tab];
        return (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <TabIcon className="size-4" />
            <span>{tab}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <form className="space-y-5">
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Patient Registration Form
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Capture patient registration details.
            </p>
          </div>
          <div className="flex w-full max-w-3xl flex-col gap-3 rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-cyan-100 lg:flex-row lg:items-end">
            <div className="relative min-w-0 flex-1">
              <Input
                label="Search Patient"
                placeholder="Search by UHID, Patient Name, Phone, or Patient ID"
                autoComplete="off"
                value={searchTerm}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() =>
                  setTimeout(() => setShowSearchResults(false), 150)
                }
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(true);
                }}
                leftIcon={<Search className="size-4" />}
              />
              {showSearchResults && debouncedSearchTerm.trim() ? (
                <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                  {searchResults.length > 0 ? (
                    <ul className="py-1.5">
                      {searchResults.map((patient) => {
                        const fullName = `${patient.firstName} ${patient.middleName} ${patient.lastName}`;
                        return (
                          <li key={patient.patientId}>
                            <button
                              type="button"
                              onMouseDown={() => populatePatientToForm(patient)}
                              className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-cyan-50/50"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-900">
                                  {fullName}
                                </p>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    patient.status === "Active"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-rose-100 text-rose-700"
                                  }`}
                                >
                                  {patient.status}
                                </span>
                              </div>
                              <div className="mt-1 grid gap-x-3 gap-y-0.5 text-xs text-slate-600 sm:grid-cols-2">
                                <p className="flex items-center gap-1.5">
                                  <IdCard className="size-3.5 text-slate-400" />
                                  UHID: {patient.uhid}
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <FileText className="size-3.5 text-slate-400" />
                                  ID: {patient.patientId}
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <Phone className="size-3.5 text-slate-400" />
                                  Phone: {patient.phoneNumber}
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <CalendarDays className="size-3.5 text-slate-400" />
                                  DOB: {patient.dob}
                                </p>
                              </div>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <CalendarDays className="size-3.5 text-slate-400" />
                                Last Visit: {patient.lastVisitDate}
                              </p>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      No patient matches found.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
            <div className="w-full lg:w-52">
              <SelectField
                id="patient-type"
                label="Patient Type"
                value={patienttype}
                onChange={(e) => {
                  const next = e.target.value;
                  setPatientType(next);
                  setIdType(next === "Kenyan" ? "National ID" : "Alien ID");
                }}
              >
                <option value="Kenyan">Kenyan</option>
                <option value="Foreigner">Foreigner</option>
              </SelectField>
            </div>
          </div>
        </div>
      </div>

      <Section description="Primary patient identifiers captured before section-specific details.">
        <Input
          label="UIHD No."
          placeholder="Patient No."
          autoComplete="patient-number"
          value={uihdNo}
          onChange={(e) => {
            const v = e.target.value;
            setUihdNo(v);
            if (v.trim()) uhidLookupMutation.mutate(v);
          }}
          onBlur={() => {
            if (uihdNo.trim()) uhidLookupMutation.mutate(uihdNo);
          }}
          leftIcon={<IdCard className="size-4" />}
        />
        <SelectField
          id="title"
          label="Name Prefix (Title)"
          leftIcon={UserRound}
        >
          <option value="">-- Select Title --</option>
          <option value="Mr">Mr.</option>
          <option value="Mrs">Mrs.</option>
          <option value="Miss">Miss.</option>
        </SelectField>
        <Input
          label="Surname / Family Name"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          placeholder="e.g. Otieno"
          autoComplete="family-name"
          leftIcon={<User className="size-4" />}
        />
        <Input
          label="First Name / Given Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="e.g. Amina"
          autoComplete="given-name"
          leftIcon={<UserRound className="size-4" />}
        />
        <Input
          label="Middle Name / Other Names"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          placeholder="e.g. Wanjiku"
          autoComplete="additional-name"
          leftIcon={<User className="size-4" />}
        />
        <SelectField id="gender" label="Gender" leftIcon={Users}>
          <option>-- Gender --</option>
          <option>Female</option>
          <option>Male</option>
        </SelectField>
        <Input
          label="Date of Birth"
          placeholder="Select date of birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          leftIcon={<CalendarDays className="size-4" />}
        />
        <Input
          label="Age"
          placeholder="Auto-calculated from date of birth"
          value={approximateAge}
          readOnly
          inputClassName="bg-slate-50 font-semibold"
        />
        <Input
          label="Primary Phone"
          placeholder="e.g. 0712 345 678"
          value={primaryPhone}
          onChange={(e) => setPrimaryPhone(e.target.value)}
          type="tel"
          leftIcon={<Phone className="size-4" />}
        />
        <SelectField
          id="nationality-secondary"
          label="Nationality"
          leftIcon={Landmark}
          value={nationality}
          disabled={isKenyan}
          onChange={(e) => setNationality(e.target.value)}
        >
          {isKenyan ? (
            <option value="Kenyan">Kenyan</option>
          ) : (
            <option value="">-- Nationality --</option>
          )}
        </SelectField>
      </Section>

      <Section
        description={sectionDescriptions[activeTab]}
        headerContent={sectionTabsContent}
      >
        {activeTab === "Demography & Contact Details" ? (
          <>
            <SelectField id="religion" label="Religion" leftIcon={Shield}>
              <option>-- Religion --</option>
              <option>Christian</option>
              <option>Muslim</option>
            </SelectField>
            <SelectField
              id="id-type"
              label="Identification Type"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              leftIcon={IdCard}
            >
              {identificationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </SelectField>
            <Input
              label={documentNumberLabel}
              placeholder="Enter document number"
              leftIcon={<IdCard className="size-4" />}
            />
            <Input
              label="Alternate Phone"
              placeholder="Optional alternate phone number"
              type="tel"
              leftIcon={<Phone className="size-4" />}
            />
            <Input
              label="Email Address"
              placeholder="e.g. patient@example.com"
              type="email"
              leftIcon={<Mail className="size-4" />}
            />
            <SelectField
              id="county"
              label="County"
              value={county}
              onChange={(e) => {
                setCounty(e.target.value);
                setSubCounty("");
              }}
              leftIcon={MapPin}
            >
              {getCounties().map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
            <SelectField
              id="sub-county"
              label="Sub-county"
              value={subCounty}
              onChange={(e) => setSubCounty(e.target.value)}
              leftIcon={MapPin}
            >
              {getSubCounties(county).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectField>
            <SelectField id="ward" label="Ward" leftIcon={MapPin}>
              {getWards(county, subCounty).map((w) => (
                <option key={w}>{w}</option>
              ))}
            </SelectField>

            <Input
              label="Village/Estate"
              placeholder="e.g. Kileleshwa"
              leftIcon={<Building2 className="size-4" />}
            />
            <Input
              label="Physical Address"
              placeholder="e.g. Rewa Apartment"
              leftIcon={<MapPin className="size-4" />}
            />
            <CommentField id="demography-comments" />
          </>
        ) : null}

        {activeTab === "NOK & Emergency Contact" ? (
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-3 lg:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Next of Kin Details
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  label="Surname"
                  placeholder="Surname"
                  value={nokSurname}
                  onChange={(e) => setNokSurname(e.target.value)}
                  leftIcon={<User className="size-4" />}
                />
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={nokFirstName}
                  onChange={(e) => setNokFirstName(e.target.value)}
                  leftIcon={<UserRound className="size-4" />}
                />
                <Input
                  label="Other Name"
                  placeholder="Other name"
                  value={nokOtherName}
                  onChange={(e) => setNokOtherName(e.target.value)}
                  leftIcon={<User className="size-4" />}
                />
                <SelectField
                  id="nok-rel"
                  label="Relationship to Patient"
                  value={nokRelationship}
                  onChange={(e) => setNokRelationship(e.target.value)}
                  leftIcon={Users}
                >
                  <option>-- Relationship --</option>
                </SelectField>
                <Input
                  label="NOK Phone"
                  placeholder="e.g. 0712 345 678"
                  value={nokPhone}
                  onChange={(e) => setNokPhone(e.target.value)}
                  leftIcon={<Phone className="size-4" />}
                />
                <Input
                  label="NOK ID Number"
                  placeholder="e.g. 12345678"
                  leftIcon={<IdCard className="size-4" />}
                />
                <Input
                  label="NOK Address"
                  placeholder="Physical address"
                  leftIcon={<MapPin className="size-4" />}
                />
                <Input
                  label="NOK Email Address"
                  placeholder="e.g. nok@example.com"
                  type="email"
                  leftIcon={<Mail className="size-4" />}
                />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 lg:col-span-1">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Emergency Contact Details
              </h3>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={sameAsNok}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSameAsNok(checked);
                    if (checked) {
                      setEmergencyName(
                        [nokFirstName, nokOtherName, nokSurname]
                          .filter(Boolean)
                          .join(" ")
                      );
                      setEmergencyRelationship(nokRelationship);
                      setEmergencyPhone(nokPhone);
                      setAlternateEmergencyPhone("");
                    }
                  }}
                  className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Same as NOK details
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Emergency Contact Name"
                  placeholder="Full name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  leftIcon={<ContactRound className="size-4" />}
                  containerClassName="sm:col-span-2"
                />
                <SelectField
                  id="emg-rel"
                  label="Relationship"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  leftIcon={Users}
                >
                  <option>-- Relationship --</option>
                </SelectField>
                <Input
                  label="Emergency Phone"
                  placeholder="e.g. 0712 345 678"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  leftIcon={<Phone className="size-4" />}
                />
                <Input
                  label="Alternate Emergency Phone"
                  placeholder="Optional alternate phone number"
                  value={alternateEmergencyPhone}
                  onChange={(e) => setAlternateEmergencyPhone(e.target.value)}
                  leftIcon={<Phone className="size-4" />}
                  containerClassName="sm:col-span-2"
                />
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "Administrative Details" ? (
          <>
            <Input
              label="Registration Date"
              placeholder="Auto-generated at registration"
              type="datetime-local"
              disabled
              leftIcon={<CalendarDays className="size-4" />}
            />
            <div className="flex h-full flex-col justify-center sm:col-span-2 xl:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={isSuspended}
                  onChange={(e) => setIsSuspended(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Suspend patient
              </label>
            </div>
            <CommentField id="administrative-comments" />
          </>
        ) : null}
      </Section>

      {activeTab === "Administrative Details" ? (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="reset"
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear details
            </button>
            <button
              type="submit"
              className="h-10 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white hover:bg-cyan-700"
            >
              Register patient
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
};

export default PatientRegistration;
