import { mockPatients } from "../constants/mockPatients";

const NETWORK_DELAY_MS = 250;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const searchPatients = async (query) => {
  const term = query.trim().toLowerCase();
  await sleep(NETWORK_DELAY_MS);

  if (!term) {
    return [];
  }

  return mockPatients.filter((patient) => {
    const fullName =
      `${patient.firstName} ${patient.middleName} ${patient.lastName}`.toLowerCase();
    return (
      patient.uhid.toLowerCase().includes(term) ||
      patient.patientId.toLowerCase().includes(term) ||
      patient.phoneNumber.toLowerCase().includes(term) ||
      fullName.includes(term)
    );
  });
};

export const getPatientByUhid = async (uhid) => {
  await sleep(NETWORK_DELAY_MS);
  return (
    mockPatients.find(
      (patient) => patient.uhid.toLowerCase() === uhid.trim().toLowerCase()
    ) ?? null
  );
};

export const getAllPatients = async () => {
  await sleep(NETWORK_DELAY_MS);
  return mockPatients;
};
