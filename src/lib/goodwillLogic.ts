import { ItemCategory } from "./types";

export type ItemCondition = "New" | "Good" | "Fair" | "Poor";

export const CATEGORY_WEIGHTS: Record<ItemCategory, number> = {
    "Electronics": 1.1,
    "Pets & Animals": 1.3,
    "Documents": 1.5,
    "Personal Items": 1.0,
    "Apparel": 0.8,
    "Other": 1.0
};

export const CONDITION_MULTIPLIERS: Record<ItemCondition, number> = {
    "New": 1.0,
    "Good": 0.85,
    "Fair": 0.6,
    "Poor": 0.3
};

// Community goodwill points — no real money involved
export interface GoodwillCalculation {
    goodwillPoints: number;
    priorityLevel: "Low" | "Medium" | "High" | "Urgent";
    categoryWeight: number;
    conditionMultiplier: number;
    isUrgent: boolean;
}

export function calculateGoodwill(
    category: ItemCategory = "Other",
    condition: ItemCondition = "Good",
    isUrgent: boolean = false
): GoodwillCalculation {
    const catWeight = CATEGORY_WEIGHTS[category] || 1.0;
    const condMult = CONDITION_MULTIPLIERS[condition] || 1.0;

    let points = Math.round(50 * catWeight * condMult);

    if (isUrgent) {
        points = Math.round(points * 1.25);
    }

    const priorityLevel: GoodwillCalculation["priorityLevel"] =
        isUrgent ? "Urgent" :
            catWeight >= 1.3 ? "High" :
                catWeight >= 1.0 ? "Medium" : "Low";

    return {
        goodwillPoints: Math.max(10, points),
        priorityLevel,
        categoryWeight: catWeight,
        conditionMultiplier: condMult,
        isUrgent
    };
}
