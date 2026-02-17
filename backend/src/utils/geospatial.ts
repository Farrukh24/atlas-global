export interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
}

export const parseGeoJSON = (geojson: any): GeoJSONPoint | null => {
    if (!geojson) return null;
    if (typeof geojson === 'string') {
        try {
            return JSON.parse(geojson);
        } catch (e) {
            return null;
        }
    }
    return geojson;
};

export const toWKT = (point: GeoJSONPoint): string => {
    return `POINT(${point.coordinates[0]} ${point.coordinates[1]})`;
};

export const toPostGISGeography = (point: GeoJSONPoint): string => {
    return `ST_GeographyFromText('SRID=4326;${toWKT(point)}')`;
};
