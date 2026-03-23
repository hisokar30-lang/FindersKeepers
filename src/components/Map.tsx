"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, Navigation } from "lucide-react";
import { Item } from "@/lib/types";

// Note: Leaflet CSS and compatibility styles are now imported in layout.tsx to avoid HMR module factory errors.
import "leaflet-defaulticon-compatibility";

// Helper to update map view
// Helper to update map view
function MapController({ coords, items }: { coords: [number, number] | null, items: Item[] }) {
    const map = useMap();

    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 13, { animate: true });
        } else if (items.length > 0) {
            // Auto-center on items bounds if no search coords
            const bounds = L.latLngBounds(items.map(item => [
                item.locationLat || 40.7128,
                item.locationLng || -74.0060
            ]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [coords, items, map]);

    return null;
}

// User Location Component
function LocationMarker() {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMap();

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        });
    }, [map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>You are here</Popup>
        </Marker>
    );
}

interface MapProps {
    items?: Item[];
}

export default function Map({ items = [] }: MapProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
    }, []);

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
            }
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    return (
        <div className="relative w-full h-[500px] rounded-[20px] overflow-hidden border border-[#22d3ee44] shadow-[0_0_30px_rgba(0,0,0,0.5)]">

            {/* Search Overlay */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2 max-w-md mx-auto pointer-events-auto">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search for a city or place..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-10 pr-4 py-3 rounded-full bg-[rgba(15,23,42,0.9)] backdrop-blur-md border border-[var(--border-subtle)] text-white placeholder-gray-400 focus:border-[var(--primary-brand)] focus:outline-none shadow-lg"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--primary-brand)]" size={18} />
                </div>
                <button
                    onClick={handleSearch}
                    className="p-3 rounded-full bg-[var(--primary-brand)] text-black font-bold hover:bg-[#06b6d4] transition-colors shadow-lg"
                >
                    <Navigation size={20} />
                </button>
            </div>

            {mounted && (
                <div style={{ height: "100%", width: "100%" }}>
                    <MapContainer
                        center={[40.7128, -74.0060]} // Default to NYC instead of London
                        zoom={11}
                        style={{ height: "100%", width: "100%", background: "#020617" }}
                    >
                        <TileLayer
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />

                        <MapController coords={mapCenter} items={items} />
                        <LocationMarker />

                        {items && items.length > 0 && items.map((item) => {
                            const icon = L.divIcon({
                                className: 'custom-div-icon',
                                html: `<div style="background-color: ${item.type === 'lost' ? '#FF3B30' : '#CCFF00'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                                iconSize: [12, 12],
                                iconAnchor: [6, 6]
                            });

                            return (
                                <Marker
                                    key={item.id}
                                    position={[item.locationLat || 40.7128, item.locationLng || -74.0060]}
                                    icon={icon}
                                >
                                    <Popup>
                                        <div className="text-black p-1">
                                            <strong className="block mb-1">{item.title}</strong>
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {item.type}
                                            </span>
                                            <div className="mt-2 text-xs text-gray-600">
                                                Location: {item.locationName}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            )}

            {/* Satellite View - No Filter Needed */}
            <style jsx global>{`
                .leaflet-layer {
                    /* filter: none; - Satellite imagery is naturally dark/rich */
                }
            `}</style>
        </div>
    );
}
