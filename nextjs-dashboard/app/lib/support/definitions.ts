// For store data types and enums that related to Hospital

export const HOSPITAL_TYPES = [
    "General",
    "Teaching",
    "Specialty",
    "Community",
    "Children",
    "Rehabilitation",
] as const;

export type HospitalType = (typeof HOSPITAL_TYPES)[number];

export const OWNERSHIP_TYPES = [
    "Government",
    "Private",
    "Non-Profit",
    "University",
] as const;

export type OwnershipType = (typeof OWNERSHIP_TYPES)[number];

export const ACCREDITATION_STATUSES = [
    "Accredited",
    "Pending",
    "Not Accredited",
] as const;

export type AccreditationStatus =
    (typeof ACCREDITATION_STATUSES)[number];

export interface Hospital {
    hospitalId: number;
    hospitalName: string;
    hospitalType: HospitalType;
    ownershipType: OwnershipType;
    addressLine: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    phoneNumber: string | null;
    email: string | null;
    website: string | null;
    bedCapacity: number;
    emergencyService: boolean;
    ambulanceService: boolean;
    establishedYear: number | null;
    accreditationStatus: AccreditationStatus;
    rating: number | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export type HospitalInput = Omit<
    Hospital,
    "hospitalId" | "createdAt" | "updatedAt"
>;
