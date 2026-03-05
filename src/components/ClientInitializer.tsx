"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function ClientInitializer() {
    const { seedMockData, items } = useStore();

    useEffect(() => {
        // Seed data if store is empty
        if (items.length === 0) {
            seedMockData();
        }
    }, [items.length, seedMockData]);

    return null;
}
