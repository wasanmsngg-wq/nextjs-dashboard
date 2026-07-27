import type { Customer } from './definitions';
import { sqlRaw as sql } from './db';

export async function fetchFilteredCustomers(query: string) {
  try {
    return await sql<Customer[]>`
      SELECT id, name, email, image_url
      FROM customers
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
      ORDER BY customers.name ASC
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customers.');
  }
}
