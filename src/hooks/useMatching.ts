import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { findNearby, getDistance } from '../lib/geoUtils';
import { Item } from '../lib/types';

export type MatchResult = Item & { distanceKm: number };

/**
 * Hook to find matching items based on category and proximity.
 */
export function useMatching(currentItem: Item | null): MatchResult[] {
    const items = useStore((state) => state.items);

    const matches = useMemo(() => {
        if (!currentItem || !currentItem.locationLat || !currentItem.locationLng) return [];

        const targetType = currentItem.type === 'lost' ? 'found' : 'lost';

        const candidatePool = items.filter(item =>
            item.id !== currentItem.id &&
            item.type === targetType &&
            item.category === currentItem.category
        );

        const nearby = findNearby(
            { lat: currentItem.locationLat, lng: currentItem.locationLng },
            candidatePool,
            5
        );

        return nearby.map(item => ({
            ...item,
            distanceKm: Number(getDistance(
                currentItem.locationLat!,
                currentItem.locationLng!,
                item.locationLat!,
                item.locationLng!
            ).toFixed(2))
        }));
    }, [currentItem, items]);

    return matches;
}
