export interface TrackingEvent {
    id: number;
    load_id: number;
    equipment_asset_id?: number;
    driver_id?: number;
    event_type: string;
    event_code: string;
    event_timestamp: Date;
    location?: any;
    speed_kph?: number;
    heading_degrees?: number;
    temperature_celsius?: number;
    created_at: Date;
}
