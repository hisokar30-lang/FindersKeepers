/**
 * Calculates the great-circle distance between two points on the Earth
 * using the Haversine formula.
 * @returns Distance in kilometers
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Filter items within a specific radius of a center point.
 */
import { Item } from './types';

export function findNearby(center: { lat: number, lng: number }, items: Item[], radiusKm: number = 5): Item[] {
    return items.filter(item => {
        if (!item.locationLat || !item.locationLng) return false;
        const dist = getDistance(center.lat, center.lng, item.locationLat, item.locationLng);
        return dist <= radiusKm;
    });
}
