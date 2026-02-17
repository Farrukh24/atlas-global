import { z } from 'zod';

export const createLoadSchema = z.object({
    body: z.object({
        shipper_party_id: z.number().optional(), // Will be set from auth
        origin_location_id: z.number(),
        destination_location_id: z.number(),
        pickup_earliest: z.string().datetime().optional(),
        pickup_latest: z.string().datetime().optional(),
        delivery_earliest: z.string().datetime().optional(),
        delivery_latest: z.string().datetime().optional(),
        equipment_type_id: z.number().optional(), // Will be converted from equipment_code
        equipment_code: z.string().optional(), // Alternative to equipment_type_id
        commodity_description: z.string().optional(),
        cargo_description: z.string().optional(), // Alias
        weight_kg: z.number().optional(),
        volume_cbm: z.number().optional(),
        quoted_rate_amount: z.number().optional(),
        quoted_rate_currency: z.string().length(3).optional()
    })
});

export const searchLoadSchema = z.object({
    query: z.object({
        origin_lat: z.coerce.number().optional(),
        origin_lng: z.coerce.number().optional(),
        origin_radius_km: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        page: z.coerce.number().optional(),
        status: z.string().optional(),
        origin: z.string().optional(),
        destination: z.string().optional(),
        equipment_code: z.string().optional(),
        pickup_date: z.string().optional(),
        shipper_party_id: z.coerce.number().optional(),
        carrier_party_id: z.coerce.number().optional(),
        load_number: z.string().optional()
    })
});
