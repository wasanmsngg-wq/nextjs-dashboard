'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sql } from '@/app/lib/db';
import {
  ACCREDITATION_STATUSES,
  HOSPITAL_TYPES,
  OWNERSHIP_TYPES,
} from '@/app/lib/support/definitions';

const optionalText = z.union([
  z.string().trim().transform((value) => value || null),
  z.null(),
]);
const optionalNumber = z.union([z.number(), z.null()]);

const hospitalSchema = z.object({
  hospitalName: z.string().trim().min(2).max(255),
  hospitalType: z.enum(HOSPITAL_TYPES),
  ownershipType: z.enum(OWNERSHIP_TYPES),
  addressLine: z.string().trim().min(3).max(255),
  city: z.string().trim().min(2).max(120),
  stateProvince: z.string().trim().min(2).max(120),
  postalCode: z.string().trim().min(2).max(30),
  country: z.string().trim().min(2).max(120),
  phoneNumber: optionalText,
  email: optionalText.pipe(z.string().email().nullable()),
  website: optionalText.pipe(z.string().url().nullable()),
  bedCapacity: z.number().int().positive(),
  emergencyService: z.boolean(),
  ambulanceService: z.boolean(),
  establishedYear: optionalNumber.pipe(
    z.number().int().min(1800).max(new Date().getFullYear()).nullable(),
  ),
  accreditationStatus: z.enum(ACCREDITATION_STATUSES),
  rating: optionalNumber.pipe(z.number().min(0).max(5).nullable()),
  latitude: optionalNumber.pipe(z.number().min(-90).max(90).nullable()),
  longitude: optionalNumber.pipe(z.number().min(-180).max(180).nullable()),
});

export type HospitalActionResult = {
  success: boolean;
  message: string;
};

function databaseMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error &&
    'code' in error &&
    error.code === '23505'
  ) {
    return 'A hospital with this email already exists.';
  }
  return 'The hospital could not be saved. Please try again.';
}

export async function createHospital(
  values: unknown,
): Promise<HospitalActionResult> {
  const parsed = hospitalSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: 'Please check the highlighted fields.' };
  }

  const h = parsed.data;
  try {
    await sql`
      INSERT INTO hospital (
        hospital_name, hospital_type, ownership_type, address_line, city,
        state_province, postal_code, country, phone_number, email, website,
        bed_capacity, emergency_service, ambulance_service, established_year,
        accreditation_status, rating, latitude, longitude
      ) VALUES (
        ${h.hospitalName}, ${h.hospitalType}, ${h.ownershipType}, ${h.addressLine},
        ${h.city}, ${h.stateProvince}, ${h.postalCode}, ${h.country},
        ${h.phoneNumber}, ${h.email}, ${h.website}, ${h.bedCapacity},
        ${h.emergencyService}, ${h.ambulanceService}, ${h.establishedYear},
        ${h.accreditationStatus}, ${h.rating}, ${h.latitude}, ${h.longitude}
      )
    `;
    revalidatePath('/support');
    return { success: true, message: 'Hospital created successfully.' };
  } catch (error) {
    console.error('Create hospital error', error);
    return { success: false, message: databaseMessage(error) };
  }
}

export async function updateHospital(
  hospitalId: number | string,
  values: unknown,
): Promise<HospitalActionResult> {
  const id = Number(hospitalId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { success: false, message: 'Invalid hospital.' };
  }
  const parsed = hospitalSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: 'Please check the highlighted fields.' };
  }

  const h = parsed.data;
  try {
    const result = await sql`
      UPDATE hospital SET
        hospital_name = ${h.hospitalName},
        hospital_type = ${h.hospitalType},
        ownership_type = ${h.ownershipType},
        address_line = ${h.addressLine},
        city = ${h.city},
        state_province = ${h.stateProvince},
        postal_code = ${h.postalCode},
        country = ${h.country},
        phone_number = ${h.phoneNumber},
        email = ${h.email},
        website = ${h.website},
        bed_capacity = ${h.bedCapacity},
        emergency_service = ${h.emergencyService},
        ambulance_service = ${h.ambulanceService},
        established_year = ${h.establishedYear},
        accreditation_status = ${h.accreditationStatus},
        rating = ${h.rating},
        latitude = ${h.latitude},
        longitude = ${h.longitude},
        updated_at = CURRENT_TIMESTAMP
      WHERE hospital_id = ${id}
      RETURNING hospital_id
    `;
    if (result.length === 0) {
      return { success: false, message: 'Hospital not found.' };
    }
    revalidatePath('/support');
    return { success: true, message: 'Hospital updated successfully.' };
  } catch (error) {
    console.error('Update hospital error', error);
    return { success: false, message: databaseMessage(error) };
  }
}

export async function deleteHospital(
  hospitalId: number | string,
): Promise<HospitalActionResult> {
  const id = Number(hospitalId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { success: false, message: 'Invalid hospital.' };
  }
  try {
    const result = await sql`
      DELETE FROM hospital
      WHERE hospital_id = ${id}
      RETURNING hospital_id
    `;
    if (result.length === 0) {
      return { success: false, message: 'Hospital not found.' };
    }
    revalidatePath('/support');
    return { success: true, message: 'Hospital deleted.' };
  } catch (error) {
    console.error('Delete hospital error', error);
    return {
      success: false,
      message: 'This hospital could not be deleted. It may be in use.',
    };
  }
}
