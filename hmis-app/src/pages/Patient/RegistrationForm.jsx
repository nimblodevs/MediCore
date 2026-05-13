/**
 * Patient Registration Form Component
 * Handles new patient registration and existing patient updates
 * Features: UHID lookup, patient search, multi-tab form, date formatting
 */

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
  RotateCcw,
  Save,
  Search,
  Shield,
  User,
  Users,
  UserRound,
  BriefcaseBusiness,
  NotebookTabs,
  CircleDollarSign,
} from "lucide-react";

// UI Components
import Input from "../../components/ui/Input";
import { getPatientByUhid, searchPatients } from "../../services/patientApi";
import {
  getCounties,
  getSubCounties,
  getWards,
} from "../../utils/kenyaLocations";

// ============================================
// STYLING & COMPONENT CONSTANTS
// ============================================

/** Base styling for form input fields */
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

// ============================================
// MAIN COMPONENT
// ============================================

const PatientRegistration = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Form visibility and navigation
  /** Currently active tab: "Demography & Contact Details" | "NOK & Emergency Contact" | "Administrative Details" */
  const [activeTab, setActiveTab] = useState("Demography & Contact Details");

  // Demography & Contact Details section
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [patienttype, setPatientType] = useState("Kenyan");
  const [nationality, setNationality] = useState("");
  const [idType, setIdType] = useState("National ID");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);

  // Administrative section
  const [isSuspended, setIsSuspended] = useState(false);

  // Patient basic information
  const [uihdNo, setUihdNo] = useState("");
  const [surname, setSurname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");

  // NOK & Emergency Contact section
  const [sameAsNok, setSameAsNok] = useState(false);
  const [nokSurname, setNokSurname] = useState("");
  const [nokFirstName, setNokFirstName] = useState("");
  const [nokOtherName, setNokOtherName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [alternateEmergencyPhone, setAlternateEmergencyPhone] = useState("");

  // Form state
  /** True when editing existing patient, false when creating new */
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  /** True while form submission is in progress */
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // FORM CONFIGURATION
  // ============================================

  /** Available form sections for tabbed interface */
  const sectionTabs = [
    "Demography & Contact Details",
    "NOK & Emergency Contact",
    "Administrative Details",
  ];

  /** Icon mappings for each section tab */
  const sectionTabIcons = {
    "Demography & Contact Details": IdCard,
    "NOK & Emergency Contact": Users,
    "Residence Details": MapPin,
    "Administrative Details": Building2,
  };
  /** Descriptions for each form section */
  const sectionDescriptions = {
    "Demography & Contact Details":
      "Capture statutory identity attributes and patient communication channels used for matching, outreach, and follow-up.",
    "NOK & Emergency Contact":
      "Record next of kin and emergency contacts for consent workflows, escalation paths, and urgent communication.",
    "Administrative Details":
      "Maintain registration metadata and account control details used for operational tracking and status management.",
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  /** Calculate patient age from date of birth (memoized to prevent unnecessary recalculations) */
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

  /** Determine patient nationality to set appropriate ID type options */
  const isKenyan = patienttype === "Kenyan";
  const identificationOptions = isKenyan
    ? ["National ID", "Military ID", "Birth Certificate", "Passport No."]
    : ["Alien ID", "Passport No.", "UNHCR Registration Number"];
  /** Generate label for document number input based on ID type selected */
  const documentNumberLabel =
    idType === "Passport No."
      ? "Passport No."
      : idType === "UNHCR Registration Number"
        ? "UNHCR Registration Number"
        : idType === "Birth Certificate"
          ? "Birth Certificate Number"
          : `${idType} Number`;

  // ============================================
  // SIDE EFFECTS
  // ============================================

  /** Debounce search input to reduce API calls */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ============================================
  // API QUERIES & MUTATIONS
  // ============================================

  /** Fetch patient search results based on debounced search term */
  const { data: searchResults = [] } = useQuery({
    queryKey: ["patient-search", debouncedSearchTerm],
    queryFn: () => searchPatients(debouncedSearchTerm),
    enabled: Boolean(debouncedSearchTerm.trim()),
  });

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Populate form fields with patient data
   * @param {Object} patient - Patient data object
   * @param {boolean} isFromSearch - True if patient was selected from search results
   */
  const populatePatientToForm = (patient, isFromSearch = false) => {
    const fullName = `${patient.firstName} ${patient.middleName} ${patient.lastName}`;
    if (isFromSearch) {
      setSearchTerm(`${patient.uhid} - ${fullName} - ${patient.phoneNumber}`);
    }
    setUihdNo(patient.uhid);
    setSurname(patient.lastName);
    setFirstName(patient.firstName);
    setMiddleName(patient.middleName);
    setDateOfBirth(patient.dob);
    setPrimaryPhone(patient.phoneNumber);
    setShowSearchResults(false);
    setIsEditingPatient(true);
  };

  /** Lookup patient by UHID when user enters it in the form */
  const uhidLookupMutation = useMutation({
    mutationFn: getPatientByUhid,
    onSuccess: (patient) => {
      if (patient) populatePatientToForm(patient, false);
    },
  });

  /**
   * Reset all form fields to empty/default values
   * Called when user clicks "Clear Details" button or after successful submission
   */
  const clearForm = () => {
    setUihdNo("");
    setSurname("");
    setFirstName("");
    setMiddleName("");
    setDateOfBirth("");
    setPrimaryPhone("");
    setSearchTerm("");
    setNationality("");
    setIdType("National ID");
    setCounty("");
    setSubCounty("");
    setIsSuspended(false);
    setNokSurname("");
    setNokFirstName("");
    setNokOtherName("");
    setNokRelationship("");
    setNokPhone("");
    setEmergencyName("");
    setEmergencyRelationship("");
    setEmergencyPhone("");
    setAlternateEmergencyPhone("");
    setSameAsNok(false);
    setIsEditingPatient(false);
  };

  /**
   * Handle form submission for patient registration or update
   * Collects all form data and prepares for API submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare patient data for API submission
      const patientData = {
        uhid: uihdNo,
        firstName,
        middleName,
        lastName: surname,
        dob: dateOfBirth,
        phoneNumber: primaryPhone,
        nationality,
        isSuspended,
        // TODO: Add other fields as needed
      };

      if (isEditingPatient) {
        // Update existing patient
        console.log("Updating patient:", patientData);
        // TODO: Connect to updatePatient API endpoint
        // await updatePatient(patientData);
      } else {
        // Create new patient
        console.log("Creating new patient:", patientData);
        // TODO: Connect to createPatient API endpoint
        // await createPatient(patientData);
      }

      // Clear form after successful submission
      // TODO: Show success toast notification
      // toast.success(isEditingPatient ? "Patient updated successfully" : "Patient registered successfully");
      clearForm();
    } catch (error) {
      // TODO: Show error toast notification
      // toast.error("An error occurred");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  /** Render section tabs for navigation */
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header Section with Search and Patient Type */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Form Title */}
          <div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Patient Registration Form
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Capture patient registration details.
            </p>
          </div>
          {/* Search Patient Box */}
          <div className="flex w-full max-w-3xl flex-col gap-3 rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-cyan-100 lg:flex-row lg:items-end">
            {/* Patient Search Field */}
            <div className="relative min-w-0 flex-1">
              <Input
                label="Search Patient"
                placeholder="Search by UHID, Patient Name, Phone, or Patient ID"
                autoComplete="off"
                value={searchTerm}
                onFocus={() => {
                  setShowSearchResults(true);
                  setIsSearchInputFocused(true);
                }}
                onBlur={() =>
                  setTimeout(() => {
                    setShowSearchResults(false);
                    setIsSearchInputFocused(false);
                  }, 150)
                }
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(true);
                  setIsSearchInputFocused(true);
                }}
                leftIcon={<Search className="size-4" />}
              />
              {/* Search Results Dropdown */}
              {showSearchResults &&
              isSearchInputFocused &&
              debouncedSearchTerm.trim() ? (
                <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                  {searchResults.length > 0 ? (
                    <ul className="py-1.5">
                      {searchResults.map((patient) => {
                        const fullName = `${patient.firstName} ${patient.middleName} ${patient.lastName}`;
                        return (
                          <li key={patient.patientId}>
                            <button
                              type="button"
                              onMouseDown={() =>
                                populatePatientToForm(patient, true)
                              }
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
            {/* Patient Type Selector */}
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

      {/* Primary Identifiers Section */}
      <Section description="Primary patient identifiers captured before section-specific details.">
        {/* UHID/Patient Number Lookup */}
        <Input
          label="UIHD No."
          placeholder="Patient No."
          autoComplete="patient-number"
          value={uihdNo}
          onFocus={() => {
            setShowSearchResults(false);
            setIsSearchInputFocused(false);
          }}
          onChange={(e) => {
            const v = e.target.value;
            setUihdNo(v);
            setShowSearchResults(false);
            setIsSearchInputFocused(false);
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
          required={true}
        >
          <option value="">-- Select Title --</option>
          <option value="Mr">Mr.</option>
          <option value="Mrs">Mrs.</option>
          <option value="Miss">Miss.</option>
          <option value="Ms">Ms.</option>
          <option value="Dr">Dr.</option>
          <option value="Prof">Prof.</option>
          <option value="Rev">Rev.</option>
          <option value="Hon">Hon.</option>
          <option value="Eng">Eng.</option>
          <option value="Capt">Capt.</option>
          <option value="Major">Major</option>
          <option value="Col">Col.</option>
          <option value="Sir">Sir</option>
          <option value="Madam">Madam</option>
          <option value="Baby">Baby</option>
          <option value="Fr">Fr.</option>
          <option value="Sr">Sr.</option>
          <option value="Bishop">Bishop</option>
          <option value="Justice">Justice</option>
          <option value="Amb">Amb.</option>
        </SelectField>
        <Input
          label="Surname / Family Name"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          placeholder="e.g. Otieno"
          autoComplete="family-name"
          required={true}
          leftIcon={<User className="size-4" />}
        />
        <Input
          label="First Name / Given Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="e.g. Amina"
          autoComplete="given-name"
          required={true}
          leftIcon={<UserRound className="size-4" />}
        />
        <Input
          label="Middle Name / Other Names"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          placeholder="e.g. Wanjiku"
          autoComplete="additional-name"
          required={true}
          leftIcon={<User className="size-4" />}
        />
        <SelectField id="gender" label="Gender" required={true} leftIcon={Users}>
          <option value="">-- Gender --</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Intersex">Intersex</option>
          <option value="Prefer Not to Say">Prefer Not to Say</option>
        </SelectField>
        <Input
          label="Date of Birth"
          placeholder="Select date of birth"
          
          type="date"
          required={true}
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          leftIcon={<CalendarDays className="size-4" />}
        />
        <Input
          label="Age"
          placeholder="Age"
          value={approximateAge}
          readOnly
          inputClassName="bg-slate-50 font-semibold max-w-38"
        />
        <Input
          label="Age Group"
          placeholder="Age group"
          //value={ageGroup}
          //onChange={(e) => setAgeGroup(e.target.value)}
          readOnly
          inputClassName="bg-slate-50 font-semibold max-w-38"
        />
        <Input
          label="Primary Phone"
          placeholder="e.g. 0712 345 678"
          value={primaryPhone}
          onChange={(e) => setPrimaryPhone(e.target.value)}
          type="tel"
          required={true}
          leftIcon={<Phone className="size-4" />}
        />
        <SelectField
          id="nationality-secondary"
          label="Nationality"
          leftIcon={Landmark}
          required={true}
          value={nationality}
          disabled={isKenyan}
          onChange={(e) => setNationality(e.target.value)}
        >
          {isKenyan ? (
            <option value="Kenyan">Kenyan</option>
          ) : (
            <>
              <option value="">-- Nationality --</option>

              {/* East Africa */}
              <option value="Kenyan">Kenyan</option>
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
              <option value="Congolese (DRC)">Congolese (DRC)</option>
              <option value="Congolese (Republic)">Congolese (Republic)</option>
              <option value="Cameroonian">Cameroonian</option>
              <option value="Central African">Central African</option>
              <option value="Chadian">Chadian</option>
              <option value="Gabonese">Gabonese</option>
              <option value="Equatorial Guinean">Equatorial Guinean</option>

              {/* Southern Africa */}
              <option value="South African">South African</option>
              <option value="Zimbabwean">Zimbabwean</option>
              <option value="Zambian">Zambian</option>
              <option value="Botswanan">Botswanan</option>
              <option value="Namibian">Namibian</option>
              <option value="Mozambican">Mozambican</option>
              <option value="Malawian">Malawian</option>
              <option value="Lesotho">Lesotho</option>
              <option value="Eswatini">Eswatini</option>
              <option value="Angolan">Angolan</option>

              {/* West Africa */}
              <option value="Nigerian">Nigerian</option>
              <option value="Ghanaian">Ghanaian</option>
              <option value="Ivorian">Ivorian</option>
              <option value="Senegalese">Senegalese</option>
              <option value="Malian">Malian</option>
              <option value="Burkinabe">Burkinabe</option>
              <option value="Liberian">Liberian</option>
              <option value="Sierra Leonean">Sierra Leonean</option>
              <option value="Gambian">Gambian</option>
              <option value="Beninese">Beninese</option>
              <option value="Togolese">Togolese</option>
              <option value="Guinean">Guinean</option>

              {/* North Africa */}
              <option value="Egyptian">Egyptian</option>
              <option value="Sudanese">Sudanese</option>
              <option value="Libyan">Libyan</option>
              <option value="Tunisian">Tunisian</option>
              <option value="Algerian">Algerian</option>
              <option value="Moroccan">Moroccan</option>

              {/* Europe */}
              <option value="British">British</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Spanish">Spanish</option>
              <option value="Dutch">Dutch</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Russian">Russian</option>
              <option value="Ukrainian">Ukrainian</option>

              {/* Asia */}
              <option value="Chinese">Chinese</option>
              <option value="Indian">Indian</option>
              <option value="Japanese">Japanese</option>
              <option value="Pakistani">Pakistani</option>
              <option value="Bangladeshi">Bangladeshi</option>
              <option value="Nepalese">Nepalese</option>
              <option value="Filipino">Filipino</option>
              <option value="Indonesian">Indonesian</option>
              <option value="Saudi Arabian">Saudi Arabian</option>
              <option value="Emirati">Emirati</option>

              {/* North America */}
              <option value="American">American</option>
              <option value="Canadian">Canadian</option>
              <option value="Mexican">Mexican</option>

              {/* South America */}
              <option value="Brazilian">Brazilian</option>
              <option value="Argentine">Argentine</option>
              <option value="Colombian">Colombian</option>
              <option value="Chilean">Chilean</option>

              {/* Oceania */}
              <option value="Australian">Australian</option>
              <option value="New Zealander">New Zealander</option>
              <option value="Fijian">Fijian</option>

              {/* Other */}
              <option value="Stateless">Stateless</option>
              <option value="Other">Other</option>
            </>
          )}
        </SelectField>
      </Section>

      {/* Main Form Sections with Tab Navigation */}
      <Section
        description={sectionDescriptions[activeTab]}
        headerContent={sectionTabsContent}
      >
        {/* Demography & Contact Details Tab */}
        {activeTab === "Demography & Contact Details" ? (
          <>
            <SelectField id="religion" label="Religion" leftIcon={Shield}>
              <option value="">-- Religion --</option>
              <option value="Christian-Catholic">Christian-Catholic</option>
              <option value="Christian">Christian</option>
              <option value="Muslim">Muslim</option>
              <option value="Hindu">Hindu</option>
              <option value="Buddhist">Buddhist</option>
              <option value="Sikh">Sikh</option>
              <option value="Jewish">Jewish</option>
              <option value="Atheist">Atheist</option>
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
              required={true}
              leftIcon={<IdCard className="size-4" />}
            />
            <Input
              label="Alternate Phone"
              placeholder="Optional alternate phone number"
              type="tel"
              required={true}
              leftIcon={<Phone className="size-4" />}
            />
            <Input
              label="Email Address"
              placeholder="e.g. patient@example.com"
              type="email"
              required={true}
              leftIcon={<Mail className="size-4" />}
            />
            <SelectField
              id="county"
              label="County"
              value={county}
              required={true}
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
              required={true}
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
              required={true}
              placeholder="e.g. Kileleshwa"
              leftIcon={<Building2 className="size-4" />}
            />
            <Input
              label="Physical Address"
              placeholder="e.g. Rewa Apartment"
              required={true}
              leftIcon={<MapPin className="size-4" />}
            />
            <SelectField
              id="patient-category"
              label="Patient Category"
              leftIcon={NotebookTabs}
            >
              <option value="General">General</option>
              <option value="Private">Private</option>
              <option value="Private-Hospital">Private-Hospital</option>
            </SelectField>
            <SelectField
              id="payment-category"
              label="Payment Category"
              leftIcon={CircleDollarSign}
            >
              
            </SelectField>
            
            <Input
              label="Employer"
              placeholder="Employer Name"
              leftIcon={<BriefcaseBusiness className="size-4" />}
            />

            <Input
              label="Last Visit Date"
              placeholder="Last Visit Date"
              type="datetime-local"
              disabled
              leftIcon={<CalendarDays className="size-4" />}
            />
            <Input
              label="Registration Date"
              placeholder="Auto-generated at registration"
              type="datetime-local"
              disabled
              leftIcon={<CalendarDays className="size-4" />}
            />
          </>
        ) : null}

        {/* Next of Kin & Emergency Contact Tab */}
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
                  <option value="">-- Relationship --</option>

                  {/* Immediate Family */}
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Husband">Husband</option>
                  <option value="Wife">Wife</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>

                  {/* Extended Family */}
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Cousin">Cousin</option>
                  <option value="Nephew">Nephew</option>
                  <option value="Niece">Niece</option>

                  {/* Other Relationships */}
                  <option value="Partner">Partner</option>
                  <option value="Fiancé">Fiancé</option>
                  <option value="Fiancée">Fiancée</option>
                  <option value="Friend">Friend</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Employer">Employer</option>
                  <option value="Employee">Employee</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Social Worker">Social Worker</option>
                  <option value="Religious Leader">Religious Leader</option>

                  {/* Emergency / Legal */}
                  <option value="Legal Representative">
                    Legal Representative
                  </option>

                  {/* Other */}
                  <option value="Other">Other</option>
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
                <Input
                  label="Employer"
                  placeholder="Employer Name"
                  leftIcon={<BriefcaseBusiness className="size-4" />}
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
                          .join(" "),
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
                  <option value="">-- Relationship --</option>

                  {/* Immediate Family */}
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Husband">Husband</option>
                  <option value="Wife">Wife</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>

                  {/* Extended Family */}
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Cousin">Cousin</option>
                  <option value="Nephew">Nephew</option>
                  <option value="Niece">Niece</option>

                  {/* Other Relationships */}
                  <option value="Partner">Partner</option>
                  <option value="Fiancé">Fiancé</option>
                  <option value="Fiancée">Fiancée</option>
                  <option value="Friend">Friend</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Employer">Employer</option>
                  <option value="Employee">Employee</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Social Worker">Social Worker</option>
                  <option value="Religious Leader">Religious Leader</option>

                  {/* Emergency / Legal */}
                  <option value="Legal Representative">
                    Legal Representative
                  </option>

                  {/* Other */}
                  <option value="Other">Other</option>
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

        {/* Administrative Details Tab */}
        {activeTab === "Administrative Details" ? (
          <>
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

      {/* Footer Action Buttons (visible only on Administrative Details tab) */}
      {activeTab === "Administrative Details" ? (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {/* Clear Details Button - Resets all form fields */}
            <button
              type="button"
              onClick={clearForm}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="size-4" />
              Clear Details
            </button>
            {/* Register/Update Button - Shows "Register Patient" for new or "Update Patient" for existing */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="size-4" />
              {isSubmitting
                ? "Processing..."
                : isEditingPatient
                  ? "Update Patient"
                  : "Register Patient"}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
};

export default PatientRegistration;
