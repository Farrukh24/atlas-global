import { query } from '../../config/database.js';
import { Location } from '../../types';

export const findLocationById = async (id: number): Promise<Location | null> => {
  const sql = `
    SELECT 
      id, location_name, location_type, is_public, owner_party_id,
      address_line1, address_line2, city, state_province, postal_code, country_code,
      ST_AsGeoJSON(geolocation)::jsonb as geolocation,
      operating_hours, contact_name, contact_phone, is_active,
      created_at, updated_at, deleted_at
    FROM locations 
    WHERE id = $1 AND deleted_at IS NULL
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

export const searchNearbyLocations = async (
  lng: number,
  lat: number,
  radiusMeters: number,
  limit: number = 20
): Promise<Location[]> => {
  const sql = `
    SELECT 
      id, location_name, location_type, is_public,
      address_line1, city, country_code,
      ST_AsGeoJSON(geolocation)::jsonb as geolocation,
      ST_Distance(geolocation, ST_SetSRID(ST_Point($1, $2), 4326)::geography) as distance_meters
    FROM locations 
    WHERE deleted_at IS NULL 
      AND ST_DWithin(geolocation, ST_SetSRID(ST_Point($1, $2), 4326)::geography, $3)
    ORDER BY distance_meters ASC
    LIMIT $4
  `;
  const result = await query(sql, [lng, lat, radiusMeters, limit]);
  return result.rows;
};

export const createOrFindLocation = async (data: any): Promise<Location> => {
  // Valid country codes that exist in our country_codes table
  const VALID_COUNTRY_CODES = ['UZ', 'KZ', 'CN', 'RU', 'TR', 'DE', 'AE', 'LV', 'PL', 'US', 'GB', 'FR', 'NL', 'BE', 'IT', 'ES'];

  // Normalize and validate country code
  const normalizeCountryCode = (code?: string): string => {
    if (!code) return 'US';
    const normalized = code.toUpperCase().substring(0, 2);
    // Check if it's a valid code, otherwise use US
    return VALID_COUNTRY_CODES.includes(normalized) ? normalized : 'US';
  };

  const countryCode = normalizeCountryCode(data.country_code);

  // First, try to find existing location with same city and country
  const findSql = `
        SELECT * FROM locations 
        WHERE city = $1 AND country_code = $2
        LIMIT 1
    `;
  const findResult = await query(findSql, [data.city, countryCode]);

  if (findResult.rows[0]) {
    return findResult.rows[0];
  }

  // If not found, create new location
  // ST_Point(longitude, latitude) - note the order!
  const insertSql = `
        INSERT INTO locations (
            location_name, city, country_code, geolocation, is_public
        ) VALUES (
            $1, $2, $3,
            ST_SetSRID(ST_Point($4, $5), 4326)::geography,
            true
        )
        RETURNING *
    `;

  const insertResult = await query(insertSql, [
    data.location_name || data.city,
    data.city,
    countryCode,
    data.longitude || 0,  // longitude first
    data.latitude || 0    // latitude second
  ]);

  return insertResult.rows[0];
};
