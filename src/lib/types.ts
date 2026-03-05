export type ItemCategory =
    | "Electronics"
    | "Personal Items"
    | "Pets & Animals"
    | "Documents"
    | "Apparel"
    | "Other";

export type ItemStatus = "Reported" | "Found" | "Resolved";

export type PostType = "lost" | "found";

export type ItemCondition = "New" | "Good" | "Fair" | "Poor";

export interface Comment {
    id: string;
    itemId: string;
    userId: string;
    userAvatar?: string;
    userName: string;
    content: string;
    createdAt: string;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    itemId?: string;
    content: string;
    imageUrl?: string;
    isRead: boolean;
    createdAt: string;
}

export interface LostItem {
    id: string;
    type: "lost";
    title: string;
    description: string;
    category: ItemCategory;
    locationName: string;
    locationLat: number;
    locationLng: number;
    date: string;
    photoUrl?: string;
    verificationQuestion?: string;
    status: ItemStatus;
    userId: string;
    createdAt: string;
    // Social
    likesCount?: number;
    commentsCount?: number;
    userHasLiked?: boolean;
    // Community
    goodwillPoints?: number;
    thankYouNote?: string;
    // Poster Info
    userName?: string;
    userAvatar?: string;
    userTrustScore?: number;
    isBoosted?: boolean;
    condition?: ItemCondition;
    isUrgent?: boolean;
}

export interface FoundItem {
    id: string;
    type: "found";
    title: string;
    description: string;
    category: ItemCategory;
    locationName: string;
    locationLat: number;
    locationLng: number;
    date: string;
    photoUrl: string;
    verificationQuestion: string;
    status: ItemStatus;
    userId: string;
    dateOfLoss?: string;
    createdAt: string;
    // Social
    likesCount?: number;
    commentsCount?: number;
    userHasLiked?: boolean;
    // Community
    goodwillPoints?: number;
    thankYouNote?: string;
    // Poster Info
    userName?: string;
    userAvatar?: string;
    userTrustScore?: number;
    isBoosted?: boolean;
    condition?: ItemCondition;
    isUrgent?: boolean;
}

export type Item = LostItem | FoundItem;

// Distributive Omit over union
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
export type NewItemInput = DistributiveOmit<Item, "id" | "createdAt" | "userId" | "status" | "likesCount" | "commentsCount" | "userHasLiked">;

export interface User {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    avatar?: string;
    trustScore: number;
    itemsReported: number;
    itemsFound: number;
    isVerified: boolean; // Community verification — FREE
    xp: number;
    level: number;
    rank: string;
    createdAt?: string;
}

export interface Match {
    id: string;
    itemId1: string;
    itemId2: string;
    score: number;
    createdAt: string;
}
