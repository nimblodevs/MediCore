/**
 * Patient Registration Form Component
 * Handles new patient registration and existing patient updates
 * Features: UHID lookup, patient search, multi-tab form, date formatting,
 *           field-level validation with friendly error messages.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertCircle,
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
// VALIDATION SCHEMA
// ============================================

/** Kenyan phone numbers: optional +254 / 0 prefix, then 7 or 1 + 8 digits. */
const KE_PHONE_REGEX = /^(\+?254|0)[17]\d{8}$/;
/** Loose ID number: 4-20 alphanumeric chars (covers National ID, Passport, etc.). */
const ID_NUMBER_REGEX = /^[A-Za-z0-9-]{4,20}$/;
/** Names: letters, spaces, hyphens, apostrophes. */
const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]*$/;

const friendlyPhone = z
  .string()
  .trim()
  .refine((v) => KE_PHONE_REGEX.test(v.replace(/\s/g, "")), {
    message: "Enter a valid phone number (e.g. 0712 345 678 or +254712345678)",
  });

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || KE_PHONE_REGEX.test(v.replace(/\s/g, "")), {
    message: "Enter a valid phone number or leave blank",
  });

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === "" || z.string().email().safeParse(v).success, {
    message: "Enter a valid email address or leave blank",
  });

const nameField = (label) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} must be 50 characters or fewer`)
    .regex(
      NAME_REGEX,
      `${label} can only contain letters, spaces, hyphens or apostrophes`
    );

const requiredSelect = (label) =>
  z.string().trim().min(1, `Please select a ${label.toLowerCase()}`);

const dobField = z
  .string()
  .min(1, "Date of birth is required")
  .refine(
    (v) => {
      const d = new Date(`${v}T00:00:00`);
      if (Number.isNaN(d.getTime())) return false;
      const today = new Date();
      if (d > today) return false;
      const ageYears =
        (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return ageYears <= 130;
    },
    {
      message: "Enter a real date of birth (not in the future, age ≤ 130)",
    }
  );

const patientSchema = z.object({
  // Primary identifiers
  title: requiredSelect("Title"),
  surname: nameField("Surname"),
  firstName: nameField("First name"),
  middleName: nameField("Middle name"),
  gender: requiredSelect("Gender"),
  dateOfBirth: dobField,
  primaryPhone: friendlyPhone,
  nationality: requiredSelect("Nationality"),

  // Demography & contact
  documentNumber: z
    .string()
    .trim()
    .min(1, "Document number is required")
    .regex(ID_NUMBER_REGEX, "Use 4-20 letters, numbers or hyphens"),
  alternatePhone: friendlyPhone,
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email must be 255 characters or fewer"),
  county: requiredSelect("County"),
  subCounty: requiredSelect("Sub-county"),
  village: z
    .string()
    .trim()
    .min(2, "Village/Estate must be at least 2 characters")
    .max(100, "Village/Estate must be 100 characters or fewer"),
  physicalAddress: z
    .string()
    .trim()
    .min(3, "Physical address must be at least 3 characters")
    .max(200, "Physical address must be 200 characters or fewer"),

  // NOK (optional, but validated when provided)
  nokPhone: optionalPhone,
  nokEmail: optionalEmail,

  // Emergency (required)
  emergencyName: z
    .string()
    .trim()
    .min(2, "Emergency contact name must be at least 2 characters")
    .max(120, "Emergency contact name must be 120 characters or fewer"),
  emergencyRelationship: requiredSelect("Relationship"),
  emergencyPhone: friendlyPhone,
  alternateEmergencyPhone: optionalPhone,
});

/** Map every validated field to the tab it lives on (for jump-to-error). */
const FIELD_TAB = {
  title: "Demography & Contact Details",
  surname: "Demography & Contact Details",
  firstName: "Demography & Contact Details",
  middleName: "Demography & Contact Details",
  gender: "Demography & Contact Details",
  dateOfBirth: "Demography & Contact Details",
  primaryPhone: "Demography & Contact Details",
  nationality: "Demography & Contact Details",
  documentNumber: "Demography & Contact Details",
  alternatePhone: "Demography & Contact Details",
  email: "Demography & Contact Details",
  county: "Demography & Contact Details",
  subCounty: "Demography & Contact Details",
  village: "Demography & Contact Details",
  physicalAddress: "Demography & Contact Details",
  nokPhone: "NOK & Emergency Contact",
  nokEmail: "NOK & Emergency Contact",
  emergencyName: "NOK & Emergency Contact",
  emergencyRelationship: "NOK & Emergency Contact",
  emergencyPhone: "NOK & Emergency Contact",
  alternateEmergencyPhone: "NOK & Emergency Contact",
};

// ============================================
// STYLING & SHARED COMPONENTS
// ============================================

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
  onBlur,
  disabled = false,
  leftIcon: Icon,
  containerClassName = "",
  error,
}) => {
  const describedBy = error ? `${id}-error` : undefined;
  return (
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
          onBlur={onBlur}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={[
            "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors focus:outline-none focus:ring-4",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-600/10",
            Icon ? "pl-10" : "",
            disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : "",
          ].join(" ")}
        >
          {children}
        </select>
      </div>
      {error ? (
        <p id={describedBy} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
};

const TextareaField = ({
  id,
  label,
  placeholder,
  className = "",
  rows = 2,
  leftIcon: LeftIcon,
  value,
  onChange,
  maxLength = 1000,
  error,
}) => {
  const describedBy = error ? `${id}-error` : undefined;
  return (
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
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={`${fieldClasses} min-h-16 resize-y py-2 ${
            LeftIcon ? "pl-9" : ""
          } ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : ""
          }`}
        />
      </div>
      {error ? (
        <p id={describedBy} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const PatientRegistration = () => {
  // --- Tab navigation ---
  const [activeTab, setActiveTab] = useState("Demography & Contact Details");

  // --- Primary identifiers ---
  const [uihdNo, setUihdNo] = useState("");
  const [title, setTitle] = useState("");
  const [surname, setSurname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [patienttype, setPatientType] = useState("Kenyan");
  const [nationality, setNationality] = useState("Kenyan");
  const [idType, setIdType] = useState("National ID");

  // --- Demography & contact ---
  const [religion, setReligion] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [ward, setWard] = useState("");
  const [village, setVillage] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [patientCategory, setPatientCategory] = useState("General");
  const [paymentCategory, setPaymentCategory] = useState("");
  const [employer, setEmployer] = useState("");

  // --- Search ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);

  // --- NOK & Emergency ---
  const [sameAsNok, setSameAsNok] = useState(false);
  const [nokSurname, setNokSurname] = useState("");
  const [nokFirstName, setNokFirstName] = useState("");
  const [nokOtherName, setNokOtherName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [nokIdNumber, setNokIdNumber] = useState("");
  const [nokAddress, setNokAddress] = useState("");
  const [nokEmail, setNokEmail] = useState("");
  const [nokEmployer, setNokEmployer] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [alternateEmergencyPhone, setAlternateEmergencyPhone] = useState("");

  // --- Administrative ---
  const [isSuspended, setIsSuspended] = useState(false);
  const [adminComments, setAdminComments] = useState("");

  // --- Form meta state ---
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Validation state ---
  const [touched, setTouched] = useState({});
  const lastNotFoundUhidRef = useRef(null);

  // ============================================
  // FORM CONFIGURATION
  // ============================================

  const sectionTabs = [
    "Demography & Contact Details",
    "NOK & Emergency Contact",
    "Administrative Details",
  ];

  const sectionTabIcons = {
    "Demography & Contact Details": IdCard,
    "NOK & Emergency Contact": Users,
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

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const ageGroup = useMemo(() => {
    if (!dateOfBirth) return "";
    const birth = new Date(`${dateOfBirth}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return "";
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const md = today.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) years -= 1;
    years = Math.max(years, 0);
    if (years < 1) return "Neonate / Infant (<1 yr)";
    if (years < 5) return "Child (1–4 yrs)";
    if (years < 13) return "Child (5–12 yrs)";
    if (years < 18) return "Adolescent (13–17 yrs)";
    if (years < 35) return "Young Adult (18–34 yrs)";
    if (years < 60) return "Adult (35–59 yrs)";
    return "Senior (60+ yrs)";
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

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  const values = useMemo(
    () => ({
      title,
      surname,
      firstName,
      middleName,
      gender,
      dateOfBirth,
      primaryPhone,
      nationality,
      documentNumber,
      alternatePhone,
      email,
      county,
      subCounty,
      village,
      physicalAddress,
      nokPhone,
      nokEmail,
      emergencyName,
      emergencyRelationship,
      emergencyPhone,
      alternateEmergencyPhone,
    }),
    [
      title,
      surname,
      firstName,
      middleName,
      gender,
      dateOfBirth,
      primaryPhone,
      nationality,
      documentNumber,
      alternatePhone,
      email,
      county,
      subCounty,
      village,
      physicalAddress,
      nokPhone,
      nokEmail,
      emergencyName,
      emergencyRelationship,
      emergencyPhone,
      alternateEmergencyPhone,
    ]
  );

  /** Run zod and return a flat { field: message } map. */
  const runValidation = (values) => {
    const result = patientSchema.safeParse(values);
    if (result.success) return {};
    const flat = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (key && !flat[key]) flat[key] = issue.message;
    }
    return flat;
  };
  const errors = useMemo(() => runValidation(values), [values]);

  /** Show an error message only if the user has touched the field or attempted submit. */
  const errorFor = (field) => (touched[field] ? errors[field] : undefined);

  const markTouched = (field) => () =>
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));

  // ─────────────────────────────────────────────────────────
  // SIDE EFFECTS
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /** Reactive NOK → Emergency sync */
  const syncedEmergencyName = sameAsNok
    ? [nokFirstName, nokOtherName, nokSurname].filter(Boolean).join(" ")
    : emergencyName;
  const syncedEmergencyRelationship = sameAsNok
    ? nokRelationship
    : emergencyRelationship;
  const syncedEmergencyPhone = sameAsNok ? nokPhone : emergencyPhone;
  const syncedAlternateEmergencyPhone = sameAsNok ? "" : alternateEmergencyPhone;

  // ─────────────────────────────────────────────────────────
  // API
  // ─────────────────────────────────────────────────────────

  /** Patient search – toast on query-level failure */
  const { data: searchResults = [] } = useQuery({
    queryKey: ["patient-search", debouncedSearchTerm],
    queryFn: () => searchPatients(debouncedSearchTerm),
    enabled: Boolean(debouncedSearchTerm.trim()),
    onError: (err) => {
      toast.error("Patient search failed", {
        description:
          err?.message ?? "Unable to reach the server. Please try again.",
      });
    },
  });

  /**
   * UHID lookup:
   *  • Found    → success toast + populate form
   *  • Not found → warning toast (suppressed on repeat of same UHID)
   *  • Error    → error toast
   */
  const uhidLookupMutation = useMutation({
    mutationFn: getPatientByUhid,
    onSuccess: (patient) => {
      if (patient) {
        populatePatientToForm(patient, false);
        toast.success("Patient found", {
          description: `${patient.firstName} ${patient.lastName} loaded successfully.`,
        });
        lastNotFoundUhidRef.current = null;
      } else {
        if (lastNotFoundUhidRef.current !== uihdNo) {
          toast.warning("No patient found", {
            description: `No record matches UHID "${uihdNo}". You may register a new patient.`,
          });
          lastNotFoundUhidRef.current = uihdNo;
        }
      }
    },
    onError: (err) => {
      toast.error("UHID lookup failed", {
        description:
          err?.message ?? "Unable to reach the server. Check your connection.",
      });
    },
  });

  // ─────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────

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
    setTouched({});
  };

  const clearForm = () => {
    setUihdNo("");
    setSurname("");
    setFirstName("");
    setMiddleName("");
    setDateOfBirth("");
    setPrimaryPhone("");
    setDocumentNumber("");
    setSearchTerm("");
    setNationality("");
    setIdType("National ID");
    setCounty("");
    setSubCounty("");
    setWard("");
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
    setTouched({});
    lastNotFoundUhidRef.current = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = runValidation(values);

    if (Object.keys(validationErrors).length > 0) {
      // Mark every invalid field as touched so messages appear.
      const allTouched = Object.keys(validationErrors).reduce((acc, k) => {
        acc[k] = true;
        return acc;
      }, {});
      setTouched((prev) => ({ ...prev, ...allTouched }));

      // Jump to the first tab containing an error.
      const firstField = Object.keys(validationErrors)[0];
      const targetTab = FIELD_TAB[firstField];
      if (targetTab && targetTab !== activeTab) setActiveTab(targetTab);

      const count = Object.keys(validationErrors).length;
      toast.error(
        `Please fix ${count} ${
          count === 1 ? "error" : "errors"
        } before submitting`,
        {
          description:
            validationErrors[firstField] +
            (count > 1 ? ` (and ${count - 1} more)` : ""),
        }
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const patientData = {
        uhid: uihdNo,
        title,
        firstName,
        middleName,
        lastName: surname,
        gender,
        dob: dateOfBirth,
        phoneNumber: primaryPhone,
        alternatePhone,
        email,
        nationality,
        idType,
        documentNumber,
        religion,
        county,
        subCounty,
        ward,
        village,
        physicalAddress,
        patientCategory,
        paymentCategory,
        employer,
        nok: {
          surname: nokSurname,
          firstName: nokFirstName,
          otherName: nokOtherName,
          relationship: nokRelationship,
          phone: nokPhone,
          idNumber: nokIdNumber,
          address: nokAddress,
          email: nokEmail,
          employer: nokEmployer,
        },
        emergency: {
          name: syncedEmergencyName,
          relationship: syncedEmergencyRelationship,
          phone: syncedEmergencyPhone,
          alternatePhone: syncedAlternateEmergencyPhone,
        },
        isSuspended,
        comments: adminComments,
      };

      // TODO: Connect to create/update endpoint.
      console.log(
        isEditingPatient ? "Updating patient:" : "Creating new patient:",
        patientData
      );

      toast.success(
        isEditingPatient
          ? "Patient updated successfully"
          : "Patient registered successfully"
      );
      clearForm();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong", {
        description: "Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  /** Count how many errors live on each tab, for the badge in tab buttons. */
  const tabErrorCounts = useMemo(() => {
    const counts = {
      "Demography & Contact Details": 0,
      "NOK & Emergency Contact": 0,
      "Administrative Details": 0,
    };
    for (const field of Object.keys(errors)) {
      if (!touched[field]) continue;
      const tab = FIELD_TAB[field];
      if (tab) counts[tab] += 1;
    }
    return counts;
  }, [errors, touched]);

  const sectionTabsContent = (
    <div className="flex flex-wrap gap-1.5">
      {sectionTabs.map((tab) => {
        const TabIcon = sectionTabIcons[tab];
        const errCount = tabErrorCounts[tab] || 0;
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
            {errCount > 0 ? (
              <span
                className={`inline-flex min-w-5 items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  activeTab === tab
                    ? "bg-white text-rose-600"
                    : "bg-rose-100 text-rose-700"
                }`}
                title={`${errCount} field${
                  errCount === 1 ? "" : "s"
                } need attention`}
              >
                <AlertCircle className="size-3" />
                {errCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Header */}
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
            <div className="w-full lg:w-52">
              <SelectField
                id="patient-type"
                label="Patient Type"
                value={patienttype}
                onChange={(e) => {
                  const next = e.target.value;
                  setPatientType(next);
                  setIdType(next === "Kenyan" ? "National ID" : "Alien ID");
                  setNationality(next === "Kenyan" ? "Kenyan" : "");
                }}
              >
                <option value="Kenyan">Kenyan</option>
                <option value="Foreigner">Foreigner</option>
              </SelectField>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Identifiers */}
      <Section description="Primary patient identifiers captured before section-specific details.">
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
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={markTouched("title")}
          error={errorFor("title")}
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
          onBlur={markTouched("surname")}
          placeholder="e.g. Otieno"
          autoComplete="family-name"
          required
          maxLength={50}
          error={errorFor("surname")}
          leftIcon={<User className="size-4" />}
        />
        <Input
          label="First Name / Given Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={markTouched("firstName")}
          placeholder="e.g. Amina"
          autoComplete="given-name"
          required
          maxLength={50}
          error={errorFor("firstName")}
          leftIcon={<UserRound className="size-4" />}
        />
        <Input
          label="Middle Name / Other Names"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          onBlur={markTouched("middleName")}
          placeholder="e.g. Wanjiku"
          autoComplete="additional-name"
          required
          maxLength={50}
          error={errorFor("middleName")}
          leftIcon={<User className="size-4" />}
        />
        <SelectField
          id="gender"
          label="Gender"
          required
          leftIcon={Users}
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          onBlur={markTouched("gender")}
          error={errorFor("gender")}
        >
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
          required
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          onBlur={markTouched("dateOfBirth")}
          max={new Date().toISOString().split("T")[0]}
          error={errorFor("dateOfBirth")}
          leftIcon={<CalendarDays className="size-4" />}
        />
        <Input
          label="Age"
          placeholder="Age"
          value={ageGroup}
          readOnly
          inputClassName="bg-slate-50 font-semibold max-w-38"
        />
        <Input
          label="Age Group"
          placeholder="Age group"
          readOnly
          inputClassName="bg-slate-50 font-semibold max-w-38"
        />
        <Input
          label="Primary Phone"
          placeholder="e.g. 0712 345 678"
          value={primaryPhone}
          onChange={(e) => setPrimaryPhone(e.target.value)}
          onBlur={markTouched("primaryPhone")}
          type="tel"
          required
          maxLength={15}
          error={errorFor("primaryPhone")}
          leftIcon={<Phone className="size-4" />}
        />
        <SelectField
          id="nationality-secondary"
          label="Nationality"
          leftIcon={Landmark}
          required
          value={nationality}
          disabled={isKenyan}
          onChange={(e) => setNationality(e.target.value)}
          onBlur={markTouched("nationality")}
          error={errorFor("nationality")}
        >
          {isKenyan ? (
            <option value="Kenyan">Kenyan</option>
          ) : (
            <>
              <option value="">-- Nationality --</option>
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
              <option value="Congolese (DRC)">Congolese (DRC)</option>
              <option value="Congolese (Republic)">Congolese (Republic)</option>
              <option value="Cameroonian">Cameroonian</option>
              <option value="Central African">Central African</option>
              <option value="Chadian">Chadian</option>
              <option value="Gabonese">Gabonese</option>
              <option value="Equatorial Guinean">Equatorial Guinean</option>
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
              <option value="Egyptian">Egyptian</option>
              <option value="Sudanese">Sudanese</option>
              <option value="Libyan">Libyan</option>
              <option value="Tunisian">Tunisian</option>
              <option value="Algerian">Algerian</option>
              <option value="Moroccan">Moroccan</option>
              <option value="British">British</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Spanish">Spanish</option>
              <option value="Dutch">Dutch</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Russian">Russian</option>
              <option value="Ukrainian">Ukrainian</option>
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
              <option value="American">American</option>
              <option value="Canadian">Canadian</option>
              <option value="Mexican">Mexican</option>
              <option value="Brazilian">Brazilian</option>
              <option value="Argentine">Argentine</option>
              <option value="Colombian">Colombian</option>
              <option value="Chilean">Chilean</option>
              <option value="Australian">Australian</option>
              <option value="New Zealander">New Zealander</option>
              <option value="Fijian">Fijian</option>
              <option value="Stateless">Stateless</option>
              <option value="Other">Other</option>
            </>
          )}
        </SelectField>
      </Section>

      {/* Tabbed sections */}
      <Section
        description={sectionDescriptions[activeTab]}
        headerContent={sectionTabsContent}
      >
        {activeTab === "Demography & Contact Details" ? (
          <>
            <SelectField
              id="religion"
              label="Religion"
              leftIcon={Shield}
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
            >
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
              required
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              onBlur={markTouched("documentNumber")}
              maxLength={20}
              error={errorFor("documentNumber")}
              leftIcon={<IdCard className="size-4" />}
            />
            <Input
              label="Alternate Phone"
              placeholder="e.g. 0712 345 678"
              type="tel"
              required
              value={alternatePhone}
              onChange={(e) => setAlternatePhone(e.target.value)}
              onBlur={markTouched("alternatePhone")}
              maxLength={15}
              error={errorFor("alternatePhone")}
              leftIcon={<Phone className="size-4" />}
            />
            <Input
              label="Email Address"
              placeholder="e.g. patient@example.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={markTouched("email")}
              maxLength={255}
              error={errorFor("email")}
              leftIcon={<Mail className="size-4" />}
            />
            <SelectField
              id="county"
              label="County"
              value={county}
              required
              onChange={(e) => {
                setCounty(e.target.value);
                setSubCounty("");
                setWard("");
              }}
              onBlur={markTouched("county")}
              error={errorFor("county")}
              leftIcon={MapPin}
            >
              <option value="">-- County --</option>
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
              required
              onChange={(e) => {
                setSubCounty(e.target.value);
                setWard("");
              }}
              onBlur={markTouched("subCounty")}
              error={errorFor("subCounty")}
              leftIcon={MapPin}
            >
              <option value="">-- Sub-county --</option>
              {getSubCounties(county).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectField>
            <SelectField
              id="ward"
              label="Ward"
              leftIcon={MapPin}
              value={ward}
              onChange={(e) => setWard(e.target.value)}
            >
              <option value="">-- Ward --</option>
              {getWards(county, subCounty).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </SelectField>

            <Input
              label="Village/Estate"
              required
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              onBlur={markTouched("village")}
              placeholder="e.g. Kileleshwa"
              maxLength={100}
              error={errorFor("village")}
              leftIcon={<Building2 className="size-4" />}
            />
            <Input
              label="Physical Address"
              placeholder="e.g. Rewa Apartment"
              required
              value={physicalAddress}
              onChange={(e) => setPhysicalAddress(e.target.value)}
              onBlur={markTouched("physicalAddress")}
              maxLength={200}
              error={errorFor("physicalAddress")}
              leftIcon={<MapPin className="size-4" />}
            />
            <SelectField
              id="patient-category"
              label="Patient Category"
              leftIcon={NotebookTabs}
              value={patientCategory}
              onChange={(e) => setPatientCategory(e.target.value)}
            >
              <option value="General">General</option>
              <option value="Private">Private</option>
              <option value="Private-Hospital">Private-Hospital</option>
            </SelectField>
            <SelectField
              id="payment-category"
              label="Payment Category"
              leftIcon={CircleDollarSign}
              value={paymentCategory}
              onChange={(e) => setPaymentCategory(e.target.value)}
            >
              <option value="">-- Payment Category --</option>
              <option value="Cash">Cash</option>
              <option value="Insurance">Insurance</option>
              <option value="NHIF">NHIF</option>
              <option value="Corporate">Corporate</option>
            </SelectField>

            <Input
              label="Employer"
              placeholder="Employer Name"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              maxLength={100}
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
                  maxLength={50}
                  leftIcon={<User className="size-4" />}
                />
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={nokFirstName}
                  onChange={(e) => setNokFirstName(e.target.value)}
                  maxLength={50}
                  leftIcon={<UserRound className="size-4" />}
                />
                <Input
                  label="Other Name"
                  placeholder="Other name"
                  value={nokOtherName}
                  onChange={(e) => setNokOtherName(e.target.value)}
                  maxLength={50}
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
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Cousin">Cousin</option>
                  <option value="Nephew">Nephew</option>
                  <option value="Niece">Niece</option>
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
                  <option value="Legal Representative">
                    Legal Representative
                  </option>
                  <option value="Other">Other</option>
                </SelectField>

                <Input
                  label="NOK Phone"
                  placeholder="e.g. 0712 345 678"
                  value={nokPhone}
                  onChange={(e) => setNokPhone(e.target.value)}
                  onBlur={markTouched("nokPhone")}
                  maxLength={15}
                  error={errorFor("nokPhone")}
                  helperText="Optional - leave blank if unavailable"
                  leftIcon={<Phone className="size-4" />}
                />
                <Input
                  label="NOK ID Number"
                  placeholder="e.g. 12345678"
                  value={nokIdNumber}
                  onChange={(e) => setNokIdNumber(e.target.value)}
                  maxLength={20}
                  leftIcon={<IdCard className="size-4" />}
                />
                <Input
                  label="NOK Address"
                  placeholder="Physical address"
                  value={nokAddress}
                  onChange={(e) => setNokAddress(e.target.value)}
                  maxLength={200}
                  leftIcon={<MapPin className="size-4" />}
                />
                <Input
                  label="NOK Email Address"
                  placeholder="e.g. nok@example.com"
                  type="email"
                  value={nokEmail}
                  onChange={(e) => setNokEmail(e.target.value)}
                  onBlur={markTouched("nokEmail")}
                  maxLength={255}
                  error={errorFor("nokEmail")}
                  leftIcon={<Mail className="size-4" />}
                />
                <Input
                  label="Employer"
                  placeholder="Employer Name"
                  value={nokEmployer}
                  onChange={(e) => setNokEmployer(e.target.value)}
                  maxLength={100}
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
                          .join(" ")
                      );
                      setEmergencyRelationship(nokRelationship);
                      setEmergencyPhone(nokPhone);
                      setAlternateEmergencyPhone("");
                      setTouched((p) => ({
                        ...p,
                        emergencyName: true,
                        emergencyRelationship: true,
                        emergencyPhone: true,
                      }));
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
                  onBlur={markTouched("emergencyName")}
                  required
                  maxLength={120}
                  error={errorFor("emergencyName")}
                  leftIcon={<ContactRound className="size-4" />}
                  containerClassName="sm:col-span-2"
                />
                <SelectField
                  id="emg-rel"
                  label="Relationship"
                  required
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  onBlur={markTouched("emergencyRelationship")}
                  error={errorFor("emergencyRelationship")}
                  leftIcon={Users}
                >
                  <option value="">-- Relationship --</option>
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
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Cousin">Cousin</option>
                  <option value="Nephew">Nephew</option>
                  <option value="Niece">Niece</option>
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
                  <option value="Legal Representative">
                    Legal Representative
                  </option>
                  <option value="Other">Other</option>
                </SelectField>
                <Input
                  label="Emergency Phone"
                  placeholder="e.g. 0712 345 678"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  onBlur={markTouched("emergencyPhone")}
                  required
                  maxLength={15}
                  error={errorFor("emergencyPhone")}
                  leftIcon={<Phone className="size-4" />}
                />
                <Input
                  label="Alternate Emergency Phone"
                  placeholder="Optional alternate phone number"
                  value={alternateEmergencyPhone}
                  onChange={(e) => setAlternateEmergencyPhone(e.target.value)}
                  onBlur={markTouched("alternateEmergencyPhone")}
                  maxLength={15}
                  error={errorFor("alternateEmergencyPhone")}
                  helperText="Optional"
                  leftIcon={<Phone className="size-4" />}
                  containerClassName="sm:col-span-2"
                />
              </div>
            </div>
          </div>
        ) : null}

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
            <TextareaField
              id="administrative-comments"
              label="Comments"
              placeholder="Add relevant notes or special considerations"
              className="sm:col-span-2 xl:col-span-2"
              leftIcon={FileText}
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              maxLength={1000}
            />
          </>
        ) : null}
      </Section>

      {/* Footer Action Buttons */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Fields marked <span className="text-rose-600">*</span> are required.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={clearForm}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="size-4" />
              Clear Details
            </button>
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
      </div>
    </form>
  );
};

export default PatientRegistration;
