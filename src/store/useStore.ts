import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Item, User, NewItemInput, PostType, ItemCategory, Message, Comment, Match } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { generateMockUsers, generateMockItems } from "@/lib/mockGenerator";
import { registerUserAction, loginUserAction } from "@/app/login/auth-actions";
import { getDistance } from "@/lib/geoUtils";
import { ItemCondition } from "@/lib/types";

const XP_PER_REPORT = 50;
const XP_PER_FOUND = 100;
const XP_PER_COMMENT = 10;
const XP_PER_MESSAGE = 5;
const XP_PER_THANK_YOU = 75;

const getLevelFromXp = (xp: number) => Math.floor(Math.sqrt(xp / 50)) + 1;
const getRankFromLevel = (level: number) => {
    if (level >= 20) return "Legendary Guardian";
    if (level >= 12) return "Master Finder";
    if (level >= 6) return "Veteran Tracker";
    if (level >= 3) return "Apprentice Scout";
    return "Rookie Finder";
};

interface StoreState {
    // Auth
    currentUser: User | null;
    users: User[];
    login: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, name: string) => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;

    // Items
    items: Item[];
    isLoading: boolean;
    fetchItems: () => Promise<void>;
    addItem: (item: NewItemInput) => Promise<void>;
    editItem: (id: string, updates: Partial<Item>) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    updateItemStatus: (id: string, status: Item["status"]) => Promise<void>;

    // Social Actions
    toggleLike: (itemId: string) => Promise<void>;
    addComment: (itemId: string, content: string) => Promise<void>;
    comments: Record<string, Comment[]>;
    fetchComments: (itemId: string) => Promise<void>;

    // Thank You Notes
    sendThankYou: (itemId: string, note: string) => Promise<void>;

    // Chat System
    messages: Message[];
    sendMessage: (receiverId: string, content: string, itemId?: string, imageUrl?: string) => Promise<void>;
    fetchMessages: () => Promise<void>;
    uploadChatPhoto: (file: File) => Promise<string | null>;
    markAsRead: (senderId: string) => Promise<void>;

    // Filters & Search
    filterType: PostType | "all";
    filterCategory: ItemCategory | "all";
    searchQuery: string;
    setFilterType: (type: PostType | "all") => void;
    setFilterCategory: (category: ItemCategory | "all") => void;
    setSearchQuery: (query: string) => void;

    // UI State
    sidebarOpen: boolean;
    toggleSidebar: () => void;

    // Mock Data
    seedMockData: () => void;
    bulkSeedLocal: (items: Item[], users: User[]) => void;

    // Matching Engine
    matches: Match[];
    checkMatches: (newItem: Item) => void;

    // Community Verification (FREE)
    activateVerification: () => Promise<void>;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            // Initial State
            currentUser: null,
            users: [],
            items: [],
            comments: {},
            messages: [],
            isLoading: false,
            filterType: "all",
            filterCategory: "all",
            searchQuery: "",
            sidebarOpen: true,
            matches: [],

            // Auth Actions
            login: async (email) => {
                const result = await loginUserAction(email);

                if (result.success && result.user) {
                    set({ currentUser: result.user as User });
                    return;
                }

                const existingUser = get().users.find(u => u.email === email);
                if (existingUser) {
                    set({ currentUser: existingUser });
                } else {
                    throw new Error(result.error || "Portal identity not found. Please initialize your account first.");
                }
            },

            logout: async () => {
                await supabase.auth.signOut();
                set({ currentUser: null });
            },

            register: async (email, name) => {
                const result = await registerUserAction(email, name);

                if (result.success && result.user) {
                    const newUser: User = {
                        ...result.user,
                        role: "user",
                        trustScore: 100,
                        itemsReported: 0,
                        itemsFound: 0,
                        xp: 0,
                        level: 1,
                        rank: "Rookie Finder",
                        isVerified: false,
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
                    } as User;

                    set((state) => ({
                        currentUser: newUser,
                        users: [...state.users, newUser]
                    }));
                    return;
                }

                console.error("Supabase Registration failed:", result.error);

                const newUser: User = {
                    id: `user_${Math.random().toString(36).substr(2, 9)}`,
                    name,
                    email,
                    role: "user",
                    trustScore: 100,
                    itemsReported: 0,
                    itemsFound: 0,
                    xp: 0,
                    level: 1,
                    rank: "Rookie Finder",
                    isVerified: false,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
                };
                set((state) => ({ currentUser: newUser, users: [...state.users, newUser] }));
            },

            updateProfile: async (updates) => {
                const { currentUser, items, comments } = get();
                if (!currentUser) return;

                const { data, error } = await supabase
                    .from('profiles')
                    .update({
                        name: updates.name,
                        avatar_url: updates.avatar,
                    })
                    .eq('id', currentUser.id);

                const updatedUser = { ...currentUser, ...updates };

                // Sync the local cache for items and comments so UI updates instantly
                const updatedItems = items.map(item => {
                    if (item.userId === currentUser.id) {
                        return {
                            ...item,
                            userName: updatedUser.name,
                            userAvatar: updatedUser.avatar,
                        };
                    }
                    return item;
                });

                const updatedComments = { ...comments };
                Object.keys(updatedComments).forEach(itemId => {
                    updatedComments[itemId] = updatedComments[itemId].map(c => {
                        if (c.userId === currentUser.id) {
                            return { ...c, userName: updatedUser.name, userAvatar: updatedUser.avatar };
                        }
                        return c;
                    });
                });

                set({
                    currentUser: updatedUser,
                    items: updatedItems,
                    comments: updatedComments
                });
            },

            // Item Actions
            fetchItems: async () => {
                set({ isLoading: true });
                const { data, error } = await supabase
                    .from('items')
                    .select('*, profiles!inner(name, avatar_url, trust_score)')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    const mappedItems: Item[] = data.map((d: any) => ({
                        ...d,
                        locationName: d.location_name,
                        locationLat: d.location_lat,
                        locationLng: d.location_lng,
                        photoUrl: d.photo_url,
                        createdAt: d.created_at,
                        userId: d.user_id,
                        userName: d.profiles?.name,
                        userAvatar: d.profiles?.avatar_url,
                        userTrustScore: d.profiles?.trust_score,
                    }));

                    const fiveMonthsAgo = Date.now() - (150 * 24 * 60 * 60 * 1000);
                    const filteredItems = mappedItems.filter(item => new Date(item.createdAt).getTime() > fiveMonthsAgo);

                    set({ items: filteredItems, isLoading: false });
                } else {
                    set({ isLoading: false });
                }
            },

            addItem: async (input: any) => {
                const { currentUser } = get();
                if (!currentUser) return;

                const newItemId = `item_${Math.random().toString(36).substr(2, 9)}`;
                const newItem: Item = {
                    ...input,
                    id: newItemId,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userAvatar: currentUser.avatar,
                    userTrustScore: currentUser.trustScore,
                    status: "Reported",
                    createdAt: new Date().toISOString(),
                    likesCount: 0,
                    commentsCount: 0,
                    userHasLiked: false,
                    isBoosted: currentUser.isVerified,
                } as Item;

                set((state) => {
                    return {
                        items: [newItem, ...state.items],
                        currentUser: {
                            ...state.currentUser!,
                            itemsReported: (state.currentUser?.itemsReported || 0) + 1,
                            xp: (state.currentUser?.xp || 0) + (input.type === "found" ? XP_PER_FOUND : XP_PER_REPORT),
                            level: getLevelFromXp((state.currentUser?.xp || 0) + (input.type === "found" ? XP_PER_FOUND : XP_PER_REPORT)),
                            rank: getRankFromLevel(getLevelFromXp((state.currentUser?.xp || 0) + (input.type === "found" ? XP_PER_FOUND : XP_PER_REPORT))),
                        },
                    };
                });

                get().checkMatches(newItem);
            },

            editItem: async (id: string, updates: Partial<Item>) => {
                const { error } = await supabase
                    .from('items')
                    .update(updates)
                    .eq('id', id);

                if (error) {
                    console.error("Error updating item in Supabase:", error);
                }

                set((state) => ({
                    items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)) as Item[]
                }));
            },

            removeItem: async (id) => {
                const { error } = await supabase
                    .from('items')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error("Error deleting item from Supabase:", error);
                }

                set((state) => ({
                    items: state.items.filter((i) => i.id !== id)
                }));
            },

            updateItemStatus: async (id, status) => {
                const { error } = await supabase
                    .from('items')
                    .update({ status })
                    .eq('id', id);

                if (error) {
                    console.error("Error updating status in Supabase:", error);
                }

                set((state) => ({
                    items: state.items.map((i) => (i.id === id ? { ...i, status } : i))
                }));
            },

            // Social Actions
            toggleLike: async (itemId) => {
                const { currentUser, items } = get();
                if (!currentUser) return;

                const updatedItems = items.map(item => {
                    if (item.id === itemId) {
                        const isLiked = item.userHasLiked;
                        return {
                            ...item,
                            userHasLiked: !isLiked,
                            likesCount: (item.likesCount || 0) + (isLiked ? -1 : 1)
                        };
                    }
                    return item;
                });

                set({ items: updatedItems });
            },

            addComment: async (itemId, content) => {
                const { currentUser, comments, items } = get();
                if (!currentUser) return;

                const newComment: Comment = {
                    id: `cmt_${Math.random().toString(36).substr(2, 9)}`,
                    itemId,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userAvatar: currentUser.avatar,
                    content,
                    createdAt: new Date().toISOString(),
                };

                const itemComments = comments[itemId] || [];

                set({
                    comments: { ...comments, [itemId]: [...itemComments, newComment] }
                });

                const updatedItems = items.map(item => {
                    if (item.id === itemId) {
                        return { ...item, commentsCount: (item.commentsCount || 0) + 1 };
                    }
                    return item;
                });
                set({ items: updatedItems });

                if (currentUser) {
                    const newXp = (currentUser.xp || 0) + XP_PER_COMMENT;
                    const newLevel = getLevelFromXp(newXp);
                    set({
                        currentUser: {
                            ...currentUser,
                            xp: newXp,
                            level: newLevel,
                            rank: getRankFromLevel(newLevel)
                        }
                    });
                }
            },

            fetchComments: async (itemId) => {
                // Local state is sufficient for MVP
            },

            // Thank You Notes (NEW FEATURE)
            sendThankYou: async (itemId, note) => {
                const { currentUser, items } = get();
                if (!currentUser) return;

                const updatedItems = items.map(item => {
                    if (item.id === itemId) {
                        return { ...item, thankYouNote: note };
                    }
                    return item;
                });

                set({ items: updatedItems });

                // Grant XP for gratitude
                const newXp = (currentUser.xp || 0) + XP_PER_THANK_YOU;
                const newLevel = getLevelFromXp(newXp);
                set({
                    currentUser: {
                        ...currentUser,
                        xp: newXp,
                        level: newLevel,
                        rank: getRankFromLevel(newLevel)
                    }
                });
            },

            // Chat System
            sendMessage: async (receiverId, content, itemId, imageUrl) => {
                const { currentUser, messages } = get();
                if (!currentUser) return;

                const newMessage: any = {
                    sender_id: currentUser.id,
                    receiver_id: receiverId,
                    content,
                    item_id: itemId,
                    image_url: imageUrl,
                    is_read: false,
                    created_at: new Date().toISOString(),
                };

                const { data, error } = await supabase
                    .from('messages')
                    .insert([newMessage])
                    .select()
                    .single();

                if (!error && data) {
                    const msg: Message = {
                        id: data.id,
                        senderId: data.sender_id,
                        receiverId: data.receiver_id,
                        itemId: data.item_id,
                        imageUrl: data.image_url,
                        content: data.content,
                        isRead: data.is_read,
                        createdAt: data.created_at,
                    };
                    set({ messages: [...messages, msg] });
                } else {
                    const fallbackMsg: Message = {
                        id: `msg_${Math.random().toString(36).substr(2, 9)}`,
                        senderId: currentUser.id,
                        receiverId,
                        itemId,
                        imageUrl,
                        content,
                        isRead: false,
                        createdAt: new Date().toISOString(),
                    };
                    set({ messages: [...messages, fallbackMsg] });
                }

                if (currentUser) {
                    const newXp = (currentUser.xp || 0) + XP_PER_MESSAGE;
                    const newLevel = getLevelFromXp(newXp);
                    set({
                        currentUser: {
                            ...currentUser,
                            xp: newXp,
                            level: newLevel,
                            rank: getRankFromLevel(newLevel)
                        }
                    });
                }
            },

            fetchMessages: async () => {
                const { currentUser } = get();
                if (!currentUser) return;

                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
                    .gt('created_at', sevenDaysAgo.toISOString())
                    .order('created_at', { ascending: true });

                if (!error && data) {
                    const mappedMessages: Message[] = data.map((d: any) => ({
                        id: d.id,
                        senderId: d.sender_id,
                        receiverId: d.receiver_id,
                        itemId: d.item_id,
                        imageUrl: d.image_url,
                        content: d.content,
                        isRead: d.is_read,
                        createdAt: d.created_at,
                    }));
                    set({ messages: mappedMessages });
                }
            },

            uploadChatPhoto: async (file) => {
                const { currentUser } = get();
                if (!currentUser) return null;

                const fileName = `${currentUser.id}/${Date.now()}-${file.name}`;
                const { data, error } = await supabase.storage
                    .from('chat-photos')
                    .upload(fileName, file);

                if (error) {
                    console.error("Chat photo upload failed:", error);
                    return null;
                }

                const { data: publicUrlData } = supabase.storage
                    .from('chat-photos')
                    .getPublicUrl(fileName);

                return publicUrlData.publicUrl;
            },

            markAsRead: async (senderId) => {
                const { currentUser, messages } = get();
                if (!currentUser) return;

                const updatedMessages = messages.map(msg => {
                    if (msg.senderId === senderId && msg.receiverId === currentUser.id && !msg.isRead) {
                        return { ...msg, isRead: true };
                    }
                    return msg;
                });
                set({ messages: updatedMessages });
            },

            // Mock Data Seeding
            seedMockData: () => {
                const mockUsers = generateMockUsers(8);
                const rawItems = generateMockItems(30, mockUsers);

                const fiveMonthsAgo = Date.now() - (150 * 24 * 60 * 60 * 1000);
                const mockItems = rawItems.filter(item => new Date(item.createdAt).getTime() > fiveMonthsAgo);

                const mockComments: Record<string, Comment[]> = {};
                mockItems.forEach(item => {
                    mockComments[item.id] = [
                        { id: `c_${item.id}_1`, itemId: item.id, userId: mockUsers[0].id, userName: mockUsers[0].name, userAvatar: mockUsers[0].avatar, content: "Great community spirit! Hope you find it soon!", createdAt: new Date().toISOString() }
                    ];
                });

                const mockMessages: Message[] = [
                    { id: "m1", senderId: mockUsers[0].id, receiverId: mockUsers[1].id, content: "Hi, I think I found your item!", isRead: false, createdAt: new Date(Date.now() - 1000000).toISOString() }
                ];

                set({
                    users: mockUsers,
                    items: mockItems,
                    comments: mockComments,
                    messages: mockMessages,
                    isLoading: false
                });
            },

            bulkSeedLocal: (items, users) => {
                set({
                    items: items,
                    users: users,
                    isLoading: false
                });
            },

            // Filter Actions
            setFilterType: (type) => set({ filterType: type }),
            setFilterCategory: (category) => set({ filterCategory: category }),
            setSearchQuery: (query) => set({ searchQuery: query }),

            // UI Actions
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            // Matching Logic
            checkMatches: (newItem) => {
                const { items, matches } = get();
                const newMatches: Match[] = [];

                items.forEach(existingItem => {
                    if (existingItem.id === newItem.id) return;
                    if (existingItem.type === newItem.type) return;
                    if (existingItem.category !== newItem.category) return;
                    if (existingItem.status === "Resolved") return;

                    const dist = getDistance(
                        newItem.locationLat,
                        newItem.locationLng,
                        existingItem.locationLat,
                        existingItem.locationLng
                    );

                    if (dist <= 5) {
                        const match: Match = {
                            id: `match_${Math.random().toString(36).substr(2, 9)}`,
                            itemId1: newItem.id,
                            itemId2: existingItem.id,
                            score: 0.8,
                            createdAt: new Date().toISOString(),
                        };
                        newMatches.push(match);
                    }
                });

                if (newMatches.length > 0) {
                    set({ matches: [...matches, ...newMatches] });
                }
            },

            // Community Verification — COMPLETELY FREE
            activateVerification: async () => {
                const { currentUser } = get();
                if (!currentUser) return;

                // Simple reputation badge activation
                set((state) => ({
                    currentUser: { ...state.currentUser!, isVerified: true }
                }));
            },
        }),
        {
            name: "finders-keepers-storage-v5",
        }
    )
);
