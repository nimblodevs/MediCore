import { useMemo, useState } from "react";
import {
  BriefcaseMedical,
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
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Input from "../../components/ui/Input";
import Tabs from "../../components/ui/Tabs";
import {
  getCounties,
  getSubCounties,
  getWards,
} from "../../utils/kenyaLocations";

const fieldClasses =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/15 hover:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const Section = ({ title, description, icon: Icon, children, variant = "default" }) => (
  <section 
    className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md ${
      variant === "highlighted" 
        ? "border-cyan-200 ring-1 ring-cyan-100" 
        : "border-slate-200"
    }`}
  >
    <div className={`px-5 py-4 sm:px-6 ${variant === "highlighted" ? "bg-gradient-to-r from-cyan-50/80 to-transparent" : "border-b border-slate-100"}`}>
      <div className="flex items-start gap-3.5">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
          variant === "highlighted"
            ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/20"
            : "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 group-hover:from-cyan-50 group-hover:to-cyan-100 group-hover:text-cyan-600"
        }`}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
    </div>
    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {children}
    </div>
  </section>
);

const SelectField = ({
  id,
  label,
  children,
  value,
  onChange,
  disabled = false,
  leftIcon: Icon,
  containerClassName = "",
  required = false,
  error,
}) => (
  <div className={["w-full", containerClassName].join(" ")}>
    <label
      htmlFor={id}
      className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
    >
      {label}
      {required && <span className="text-xs text-red-500">*</span>}
    </label>

    <div className="relative">
      {Icon ? (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-500" />
      ) : null}

      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={`${fieldClasses} appearance-none cursor-pointer ${
          Icon ? "pl-10.5" : ""
        } ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-400" : ""} ${
          error ? "border-red-300 focus:border-red-400 focus:ring-red-500/15" : ""
        }`}
      >
        {children}
      </select>
      
      {/* Custom dropdown arrow */}
      <span className="pointer-events-none absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center text-slate-400">
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
    
    {error && (
      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
        <AlertCircle className="size-3" />
        {error}
      </p>
    )}
  </div>
);

// Free-text block used for longer notes and narrative clinical context.
const TextareaField = ({
  id,
  label,
  placeholder,
  className = "",
  rows = 2,
  compact = false,
  leftIcon: LeftIcon,
  value,
  onChange,
  error,
  required = false,
}) => (
  <div className={className}>
    <label
      htmlFor={id}
      className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
    >
      {label}
      {required && <span className="text-xs text-red-500">*</span>}
    </label>
    <div className="relative">
      {LeftIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-start pt-2.5 text-slate-400 transition-colors group-focus-within:text-cyan-500">
          <LeftIcon className="size-4" />
        </span>
      ) : null}
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${fieldClasses} ${
          compact ? "min-h-[72px]" : "min-h-[88px]"
        } resize-y py-2.5 ${LeftIcon ? "pl-10" : ""} ${
          error ? "border-red-300 focus:border-red-400 focus:ring-red-500/15" : ""
        }`}
      />
    </div>
    {error && (
      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
        <AlertCircle className="size-3" />
        {error}
      </p>
    )}
  </div>
);

// Reusable comments field used at the end of most sections.
const CommentField = ({ id, label = "Additional Comments" }) => (
  <TextareaField
    id={id}
    label={label}
    placeholder="Add relevant notes or special considerations..."
    className="sm:col-span-2 xl:col-span-3"
    compact
    leftIcon={FileText}
  />
);

const PatientRegistration = () => {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [patienttype, setPatientType] = useState("Kenyan");
  const [nationality, setNationality] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [idType, setIdType] = useState("National ID");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [activeTab, setActiveTab] = useState("demography");

  const tabs = [
    { id: "demography", label: "Demography", icon: IdCard },
    { id: "contact", label: "Contact Details", icon: Phone },
    { id: "nextOfKin", label: "Next of Kin", icon: Users },
    { id: "emergency", label: "Emergency Contact", icon: ContactRound },
    { id: "residence", label: "Residence", icon: MapPin },
    { id: "administrative", label: "Administrative", icon: BriefcaseMedical },
  ];

  const approximateAge = useMemo(() => {
    if (!dateOfBirth) {
      return "";
    }

    const birthDate = new Date(`${dateOfBirth}T00:00:00`);

    if (Number.isNaN(birthDate.getTime())) {
      return "";
    }

    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) {
      months -= 1;
    }

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
  const documentNumberLabel = isKenyan
    ? "ID number"
    : idType === "Passport No."
    ? "Passport No."
    : idType === "UNHCR Registration Number"
    ? "UNHCR Registration Number"
    : `${idType} number`;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header: search and nationality context before data entry starts. */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-cyan-50/50 px-6 py-5 shadow-sm sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-100/40 via-transparent to-transparent" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/25">
                <UserRound className="size-6" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Patient Registration
              </h1>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              Capture demographic, contact, next of kin, emergency, and residence details for a new patient record. 
              All fields marked with <span className="text-red-500">*</span> are required.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl bg-white/90 p-3.5 shadow-sm ring-1 ring-cyan-100 backdrop-blur-sm lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <Input
                label="Search Existing Patient"
                placeholder="Search by name or ID..."
                autoComplete="off"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                leftIcon={<Search className="size-4" />}
              />
            </div>
            <div className="w-full lg:w-44">
              <SelectField
                id="patient-type"
                label="Patient Type"
                value={patienttype}
                onChange={(event) => {
                  const nextNationality = event.target.value;
                  setPatientType(nextNationality);
                  setIdType(
                    nextNationality === "Kenyan" ? "National ID" : "Alien ID"
                  );
                }}
              >
                <option value="Kenyan">Kenyan</option>
                <option value="Foreigner">Foreigner</option>
              </SelectField>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for form sections */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Demography: core identity and document details. */}
      {activeTab === "demography" && (
      <Section
        title="Demography"
        description="Core identity information used for patient matching and statutory reporting."
        icon={IdCard}
      >
        <Input
          label="UIHD No."
          placeholder="MRN0002564"
          autoComplete="patient-number"
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

          <option value="Dr">Dr.</option>
          <option value="Prof">Prof.</option>
          <option value="Eng">Eng.</option>

          <option value="Sr">Sr.</option>
          <option value="Br">Br.</option>
          <option value="Rev">Rev.</option>
          <option value="Pastor">Pastor</option>
          <option value="Imam">Imam</option>
          <option value="Sheikh">Sheikh</option>

          <option value="Chief">Chief</option>
          <option value="Hon">Hon.</option>
          <option value="Capt">Capt.</option>
          <option value="Col">Col.</option>
          <option value="Maj">Maj.</option>

          <option value="Baby">Baby</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </SelectField>
        <Input
          label="Surname / Family Name"
          placeholder="e.g. Otieno"
          autoComplete="family-name"
          leftIcon={<User className="size-4" />}
        />
        <Input
          label="First Name / Given Name"
          placeholder="e.g. Amina"
          autoComplete="given-name"
          leftIcon={<UserRound className="size-4" />}
          containerClassName="min-w-0"
        />
        <Input
          label="Middle Name / Other Names"
          placeholder="e.g. Wanjiku"
          autoComplete="additional-name"
          leftIcon={<User className="size-4" />}
          containerClassName="min-w-0"
        />
        <SelectField id="gender" label="Gender" leftIcon={Users}>
          <option>-- Gender --</option>
          <option>Female</option>
          <option>Male</option>
          <option>Prefer not to say</option>
          <option>Intersex</option>
        </SelectField>
        <Input
          label="Date of birth"
          type="date"
          value={dateOfBirth}
          leftIcon={<CalendarDays className="size-4" />}
          onChange={(event) => setDateOfBirth(event.target.value)}
          containerClassName="max-w-56"
        />
        <Input
          label="Age"
          type="text"
          placeholder="Years and months"
          value={approximateAge}
          readOnly
          helperText="Auto-calculated from date of birth"
          inputClassName="bg-slate-50"
          containerClassName="max-w-56"
        />
        <SelectField id="religion" label="Religion" leftIcon={Shield}>
          <option>-- Religion --</option>
          <option>Christian</option>
          <option>Christian</option>
          <option>Muslim</option>
          <option>Hindu</option>
          <option>Traditional</option>
          <option>None</option>
          <option>Other</option>
        </SelectField>
        <SelectField
          id="nationality-secondary"
          label="Nationality"
          leftIcon={Landmark}
          value={nationality}
          disabled={isKenyan}
          onChange={(event) => setNationality(event.target.value)}
        >
          {isKenyan ? (
            <option value="Kenyan">Kenyan</option>
          ) : (
            <>
              <option value="">-- Nationality --</option>
              <option value="Ugandan">Ugandan</option>
              <option value="Tanzanian">Tanzanian</option>
              <option value="Rwandan">Rwandan</option>
              <option value="Burundian">Burundian</option>
              <option value="South Sudanese">South Sudanese</option>
              <option value="Somali">Somali</option>
              <option value="Ethiopian">Ethiopian</option>
              <option value="Eritrean">Eritrean</option>
              <option value="Djiboutian">Djiboutian</option>

              {/* Central Africa */}
              <option value="Congolese">Congolese</option>
              <option value="Central African">Central African</option>
              <option value="Cameroonian">Cameroonian</option>
              <option value="Chadian">Chadian</option>

              {/* Southern Africa */}
              <option value="Zambian">Zambian</option>
              <option value="Zimbabwean">Zimbabwean</option>
              <option value="Malawian">Malawian</option>
              <option value="Mozambican">Mozambican</option>
              <option value="Botswanan">Botswanan</option>
              <option value="Namibian">Namibian</option>
              <option value="South African">South African</option>
              <option value="Lesotho">Lesotho</option>
              <option value="Eswatini">Eswatini</option>

              {/* West Africa */}
              <option value="Nigerian">Nigerian</option>
              <option value="Ghanaian">Ghanaian</option>
              <option value="Senegalese">Senegalese</option>
              <option value="Ivorian">Ivorian</option>
              <option value="Malian">Malian</option>
              <option value="Guinean">Guinean</option>

              {/* North Africa */}
              <option value="Egyptian">Egyptian</option>
              <option value="Sudanese">Sudanese</option>
              <option value="Libyan">Libyan</option>
              <option value="Algerian">Algerian</option>
              <option value="Moroccan">Moroccan</option>
              <option value="Tunisian">Tunisian</option>

              {/* International */}
              <option value="American">American</option>
              <option value="Canadian">Canadian</option>
              <option value="British">British</option>
              <option value="German">German</option>
              <option value="French">French</option>
              <option value="Italian">Italian</option>
              <option value="Indian">Indian</option>
              <option value="Pakistani">Pakistani</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Australian">Australian</option>

              <option value="Refugee">Refugee</option>
              <option value="Stateless">Stateless</option>
              <option value="Other">Other</option>
            </>
          )}
        </SelectField>
        <SelectField
          id="id-type"
          label="Identification type"
          value={idType}
          onChange={(event) => setIdType(event.target.value)}
          leftIcon={IdCard}
        >
          {identificationOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
        <Input
          label={documentNumberLabel}
          leftIcon={<IdCard className="size-4" />}
          placeholder={
            isKenyan
              ? "e.g. 12345678"
              : idType === "Passport No."
              ? "e.g. P1234567"
              : idType === "UNHCR Registration Number"
              ? "e.g. UNHCR-123456"
              : "Enter document number"
          }
        />
        {!isKenyan ? (
          <>
            <Input
              label="Country of citizenship"
              placeholder="e.g. Uganda"
              leftIcon={<Landmark className="size-4" />}
            />
            <Input
              label="Passport expiry date"
              type="date"
              leftIcon={<CalendarDays className="size-4" />}
            />
            <Input
              label="UNHCR registration number"
              placeholder="e.g. UNHCR-123456"
              leftIcon={<FileText className="size-4" />}
            />
            <Input
              label="Embassy contact"
              placeholder="Embassy name and phone"
              leftIcon={<Phone className="size-4" />}
            />
          </>
        ) : null}
        <SelectField
          id="marital-status"
          label="Marital status"
          leftIcon={Users}
        >
          <option>-- Marital status --</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Separated">Separated</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
          <option value="Engaged">Engaged</option>
          <option value="Annulled">Annulled Marriage</option>
          <option value="Polygamous Marriage">Polygamous Marriage</option>

          <option value="Prefer not to say">Prefer not to say</option>
        </SelectField>
        <CommentField id="demography-comments" />
      </Section>
      )}

      {/* Contact Details: patient communication channels. */}
      {activeTab === "contact" && (
      <Section
        title="Contact Details"
        description="Primary channels the hospital can use for communication and follow-up."
        icon={Phone}
      >
        <Input
          label="Primary phone"
          type="tel"
          placeholder="e.g. 0712 345 678"
          leftIcon={<Phone className="size-4" />}
        />
        <Input
          label="Alternate phone"
          type="tel"
          placeholder="Optional"
          leftIcon={<Phone className="size-4" />}
        />
        <Input
          label="Email address"
          type="email"
          placeholder="patient@example.com"
          leftIcon={<Mail className="size-4" />}
        />
        <CommentField id="contact-comments" />
      </Section>
      )}

      {/* Next of Kin: primary family or guardian contact. */}
      {activeTab === "nextOfKin" && (
      <Section
        title="Next of Kin Details"
        description="Preferred next of kin for consent, updates, and care coordination."
        icon={Users}
      >
        <Input
          label="Surname"
          placeholder="Surname"
          leftIcon={<User className="size-4" />}
        />
        <Input
          label="First Name"
          placeholder="First Name"
          leftIcon={<UserRound className="size-4" />}
        />
        <Input
          label="Other Name"
          placeholder="Other Name"
          leftIcon={<User className="size-4" />}
        />
        <SelectField
          id="nok-relationship"
          label="Relationship to Patient"
          leftIcon={Users}
        >
          <option value="Relationship">-- Relationship --</option>
          <option value="Spouse">Spouse</option>
          <option value="Parent">Parent</option>
          <option value="Child">Child</option>
          <option value="Sibling">Sibling</option>
          <option value="Guardian">Legal Guardian</option>
          <option value="Grandparent">Grandparent</option>
          <option value="Grandchild">Grandchild</option>
          <option value="Aunt">Aunt</option>
          <option value="Uncle">Uncle</option>
          <option value="Cousin">Cousin</option>
          <option value="Niece">Niece</option>
          <option value="Nephew">Nephew</option>
          <option value="mother-In-law">Mother-in-law</option>
          <option value="father-In-law">Father-in-law</option>
          <option value="Partner">Partner</option>
          <option value="Fiancé/Fiancée">Fiancé/Fiancée</option>
          <option value="Friend">Friend</option>
          <option value="Employer">Employer</option>
          <option value="Colleague">Colleague</option>
          <option value="Caregiver">Caregiver</option>
          <option value="Community Leader">Community Leader</option>
          <option value="Other relative">Other relative</option>
          <option value="Other">Other</option>
          <option value="Unknown">Unknown</option>
        </SelectField>
        <Input
          label="NOK phone"
          type="tel"
          placeholder="e.g.0712 345 678"
          leftIcon={<Phone className="size-4" />}
        />
        <Input
          label="NOK ID number"
          placeholder="eg.12345648"
          leftIcon={<IdCard className="size-4" />}
        />
        <Input
          label="NOK address"
          placeholder="Physical address"
          leftIcon={<MapPin className="size-4" />}
          className="sm:col-span-2 xl:col-span-2"
        />
        <Input
          label="NOK Email address"
          type="nok-email"
          placeholder="nok@example.com"
          leftIcon={<Mail className="size-4" />}
        />
      </Section>
      )}

      {/* Emergency Contact: used for urgent escalation. */}
      {activeTab === "emergency" && (
      <Section
        title="Emergency Contact Details"
        description="Person to contact immediately during critical incidents."
        icon={BriefcaseMedical}
      >
        <Input
          label="Emergency contact name"
          placeholder="Full name"
          leftIcon={<ContactRound className="size-4" />}
        />
        <SelectField
          id="emergency-relationship"
          label="Relationship"
          leftIcon={Users}
        >
          <option value="Relationship">-- Relationship --</option>
          <option value="Spouse">Spouse</option>
          <option value="Parent">Parent</option>
          <option value="Child">Child</option>
          <option value="Sibling">Sibling</option>
          <option value="Guardian">Legal Guardian</option>
          <option value="Grandparent">Grandparent</option>
          <option value="Grandchild">Grandchild</option>
          <option value="Aunt">Aunt</option>
          <option value="Uncle">Uncle</option>
          <option value="Cousin">Cousin</option>
          <option value="Niece">Niece</option>
          <option value="Nephew">Nephew</option>
          <option value="mother-In-law">Mother-in-law</option>
          <option value="father-In-law">Father-in-law</option>
          <option value="Partner">Partner</option>
          <option value="Fiancé/Fiancée">Fiancé/Fiancée</option>
          <option value="Friend">Friend</option>
          <option value="Employer">Employer</option>
          <option value="Colleague">Colleague</option>
          <option value="Caregiver">Caregiver</option>
          <option value="Community Leader">Community Leader</option>
          <option value="Other relative">Other relative</option>
          <option value="Other">Other</option>
          <option value="Unknown">Unknown</option>
        </SelectField>
        <Input
          label="Emergency phone"
          type="tel"
          placeholder="e.g. 0712 345 678"
          leftIcon={<Phone className="size-4" />}
        />
        <Input
          label="Alternate emergency phone"
          type="tel"
          placeholder="Optional"
          leftIcon={<Phone className="size-4" />}
        />
      </Section>
      )}

      {/* Residence Details and physical address information. */}
      {activeTab === "residence" && (
      <Section
        title="Residence Details"
        description="Kenyan administrative location and physical residence details."
        icon={MapPin}
      >
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
          {getCounties().map((countyName) => (
            <option key={countyName} value={countyName}>
              {countyName}
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
          {getSubCounties(county).map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </SelectField>
        <SelectField id="ward" label="Ward" leftIcon={MapPin}>
          {getWards(county, subCounty).map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </SelectField>
        <Input
          label="Location"
          placeholder="Administrative location"
          leftIcon={<MapPin className="size-4" />}
        />
        <Input
          label="Sub-location"
          placeholder="Administrative sub-location"
          leftIcon={<MapPin className="size-4" />}
        />
        <Input
          label="Village/Estate"
          placeholder="e.g. Kileleshwa"
          leftIcon={<Building2 className="size-4" />}
        />
        <Input
          label="Physical address"
          placeholder="e.g. Rewa Apartment"
          leftIcon={<MapPin className="size-4" />}
        />
      </Section>
      )}

      {/* Administrative Details: registration metadata used by the facility. */}
      {activeTab === "administrative" && (
      <Section
        title="Administrative Details"
        description="Facility-facing registration metadata for patient tracking."
        icon={Building2}
      >
        <Input
          label="Registration date"
          type="datetime-local"
          disabled={true}
          leftIcon={<CalendarDays className="size-4" />}
          containerClassName="max-w-72"
        />

        <div className="flex h-full flex-col justify-center sm:col-span-2 xl:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={isSuspended}
              onChange={(event) => setIsSuspended(event.target.checked)}
              className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />
            Suspend patient
          </label>
          <p className="mb-1.5 text-xs text-slate-500">
            Mark this patient inactive until the suspension reason is resolved.
          </p>
          {isSuspended ? (
            <div className="mt-2">
              <TextareaField
                id="suspension-reason"
                label="Suspension reason"
                placeholder="Explain why the patient is suspended"
                rows={3}
                value={suspensionReason}
                onChange={(event) => setSuspensionReason(event.target.value)}
                leftIcon={FileText}
              />
            </div>
          ) : null}
        </div>
        <CommentField id="administrative-comments" />
      </Section>
      )}

      {/* Footer actions: kept sticky so clear and submit remain visible. */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10"
            >
              <FileText className="size-4 text-slate-400 transition-colors group-hover:text-red-500" />
              Clear details
            </button>
            <button
              type="submit"
              className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition-all duration-200 hover:from-cyan-700 hover:to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/25"
            >
              <CheckCircle2 className="size-4" />
              Register Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
