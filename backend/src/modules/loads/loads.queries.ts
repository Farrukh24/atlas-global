import { query } from '../../config/database.js';
import { Load, LoadSearchParams, LoadWithRelations } from '../../types';

export const findLoadById = async (id: number): Promise<LoadWithRelations | null> => {
  const sql = `
    SELECT l.*, 
           sh.legal_name as shipper_name,
           orig.location_name as origin_name, orig.city as origin_city, orig.country_code as origin_country,
           dest.location_name as destination_name, dest.city as destination_city, dest.country_code as destination_country,
           eq.code as equipment_code
    FROM loads l
    JOIN parties sh ON l.shipper_party_id = sh.id
    JOIN locations orig ON l.origin_location_id = orig.id
    JOIN locations dest ON l.destination_location_id = dest.id
    JOIN equipment_types eq ON l.equipment_type_id = eq.id
    WHERE l.id = $1 AND l.deleted_at IS NULL
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

export const searchLoads = async (params: LoadSearchParams): Promise<LoadWithRelations[]> => {
  const { origin_lat, origin_lng, radius_km, limit = 50, page = 1, shipper_party_id, status, load_number, origin, destination, equipment_code, pickup_date } = params;
  const offset = (page - 1) * limit;

  let whereClauses = ["l.deleted_at IS NULL"];
  let values: any[] = [];
  let index = 1;

  // Handle status filter:
  // 1. If status is explicitly provided, use it.
  // 2. If no status provided AND no shipper_id provided (public search), default to posted/pending.
  // 3. If shipper_id provided but no status, show all (active/history).
  if (status && status.length > 0) {
    const statusPlaceholders = status.map((_, i) => `$${index + i}`).join(', ');
    whereClauses.push(`l.status IN (${statusPlaceholders})`);
    values.push(...status);
    index += status.length;
  } else if (!shipper_party_id && !load_number) {
    whereClauses.push("l.status IN ('posted', 'pending_offer')");
  }

  if (shipper_party_id) {
    whereClauses.push(`l.shipper_party_id = $${index}`);
    values.push(shipper_party_id);
    index++;
  }

  if (params.carrier_party_id) {
    whereClauses.push(`l.carrier_party_id = $${index}`);
    values.push(params.carrier_party_id);
    index++;
  }

  if (load_number) {
    whereClauses.push(`l.load_number ILIKE $${index}`);
    values.push(`%${load_number}%`);
    index++;
  }

  if (params.search) {
    whereClauses.push(`(
      l.load_number ILIKE $${index} OR 
      orig.city ILIKE $${index} OR 
      dest.city ILIKE $${index} OR
      sh.legal_name ILIKE $${index}
    )`);
    values.push(`%${params.search}%`);
    index++;
  }

  // Origin city filter
  if (origin) {
    whereClauses.push(`orig.city ILIKE $${index}`);
    values.push(`%${origin}%`);
    index++;
  }

  // Destination city filter
  if (destination) {
    whereClauses.push(`dest.city ILIKE $${index}`);
    values.push(`%${destination}%`);
    index++;
  }

  // Equipment code filter
  if (equipment_code) {
    whereClauses.push(`eq.code ILIKE $${index}`);
    values.push(`%${equipment_code}%`);
    index++;
  }

  // Pickup date filter (loads on or after this date)
  if (pickup_date) {
    whereClauses.push(`l.pickup_earliest >= $${index}`);
    values.push(pickup_date);
    index++;
  }

  if (origin_lat && origin_lng && radius_km) {
    whereClauses.push(`ST_DWithin(orig.geolocation, ST_SetSRID(ST_Point($${index}, $${index + 1}), 4326)::geography, $${index + 2} * 1000)`);
    values.push(origin_lng, origin_lat, radius_km);
    index += 3;
  }

  values.push(limit, offset);

  const sql = `
    SELECT l.*, 
           sh.legal_name as shipper_name,
           orig.location_name as origin_name, orig.city as origin_city, orig.country_code as origin_country,
           dest.location_name as destination_name, dest.city as destination_city, dest.country_code as destination_country,
           eq.code as equipment_code
           ${origin_lat ? `, ST_Distance(orig.geolocation, ST_SetSRID(ST_Point($${values.indexOf(origin_lng) + 1}, $${values.indexOf(origin_lat) + 1}), 4326)::geography) as distance_from_search` : ''}
    FROM loads l
    JOIN parties sh ON l.shipper_party_id = sh.id
    JOIN locations orig ON l.origin_location_id = orig.id
    JOIN locations dest ON l.destination_location_id = dest.id
    JOIN equipment_types eq ON l.equipment_type_id = eq.id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY ${origin_lat ? 'distance_from_search ASC' : 'l.created_at DESC'}
    LIMIT $${index} OFFSET $${index + 1}
  `;

  const result = await query(sql, values);
  return result.rows;
};

export const createLoad = async (data: any): Promise<Load> => {
  const columns = Object.keys(data);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO loads (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const result = await query(sql, Object.values(data));
  return result.rows[0];
};

export const bookLoad = async (
  loadId: number,
  carrierId: number,
  equipmentId: number | null,
  driverId: number | null,
  rateAmount: number,
  rateCurrency: string
): Promise<void> => {
  const sql = `
    UPDATE loads 
    SET status = 'booked',
        carrier_party_id = $2,
        assigned_equipment_id = $3,
        assigned_driver_id = $4,
        booked_rate_amount = $5,
        booked_rate_currency = $6,
        booked_at = NOW(),
        updated_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
  `;
  await query(sql, [loadId, carrierId, equipmentId, driverId, rateAmount, rateCurrency]);
};

export const updateLoad = async (id: number, data: any): Promise<Load> => {
  // Filter out fields that shouldn't be updated directly
  const { id: _, created_at, deleted_at, load_number, ...updateData } = data;

  const columns = Object.keys(updateData);
  const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');

  const sql = `
    UPDATE loads 
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await query(sql, [id, ...Object.values(updateData)]);
  return result.rows[0];
};

export const deleteLoad = async (id: number): Promise<void> => {
  // Soft delete
  const sql = `
    UPDATE loads 
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
  `;
  await query(sql, [id]);
};
