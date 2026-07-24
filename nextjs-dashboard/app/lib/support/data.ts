import {Hospital} from "@/app/lib/support/definitions";
import {sql} from "@/app/lib/db";
import {normalizeHospitalPageSize} from '@/app/lib/support/pagination';

export async function fetchHospitals(
        query: string,
        page: number,
        pageSize: number,
){
    if (!Number.isSafeInteger(page) || page < 1) {
        throw new RangeError(
            'currentPage must be a positive integer',
        );
    }
    try{
        const safePageSize = normalizeHospitalPageSize(pageSize);
        const offset = (page - 1) * safePageSize;
        const searchTerm = `%${query.trim()}%`;
        return await sql<Hospital[]>`
        SELECT *
        FROM hospital
        WHERE
          hospital_name ILIKE ${searchTerm}
          OR city ILIKE ${searchTerm}
          OR state_province ILIKE ${searchTerm}
          OR country ILIKE ${searchTerm}
          OR hospital_type::text ILIKE ${searchTerm}
          OR ownership_type::text ILIKE ${searchTerm}
        ORDER BY hospital_id DESC
        LIMIT ${safePageSize}
        OFFSET ${offset}
      `;
    }catch (e) {
        console.error('Database error',e)
        throw new Error('Failed to fetch hospital data.')
    }
}

export async function fetchHospitalPages(query: string, pageSize: number){
    const searchTerm = `%${query.trim()}%`;
    const [result] = await sql<{count: number}[]>`
        SELECT COUNT(*)::int as count from hospital
        WHERE hospital_name ILIKE ${searchTerm}
        OR city ILIKE ${searchTerm}
        OR state_province ILIKE ${searchTerm}
        OR country ILIKE ${searchTerm}
        OR hospital_type::text ILIKE ${searchTerm}
        OR ownership_type::text ILIKE ${searchTerm}
    `
    return Math.ceil(result.count / normalizeHospitalPageSize(pageSize));
}

export async function fetchHospitalById(hospitalId: number) {
    const [hospital] = await sql<Hospital[]>`
        SELECT * FROM hospital WHERE hospital_id = ${hospitalId}
    `;
    return hospital ?? null;
}
