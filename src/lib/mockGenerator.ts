import { Item, ItemCategory, User } from './types';

const CATEGORIES: ItemCategory[] = [
    "Electronics",
    "Personal Items",
    "Pets & Animals",
    "Documents",
    "Apparel",
    "Other"
];

const NAMES = [
    "James Wilson", "Mary Johnson", "Robert Smith", "Patricia Brown", "Michael Davis",
    "Linda Garcia", "William Martinez", "Barbara Jones", "David Miller", "Elizabeth Taylor",
    "Richard Anderson", "Jennifer White", "Thomas Harris", "Maria Clark", "Charles Lewis",
    "Susan Robinson", "Christopher Walker", "Margaret Hall", "Daniel Young", "Alice Allen",
    "Joseph Wright", "Dorothy King", "Kevin Baker", "Sarah Green", "Jason Adams"
];

const ITEM_DATA: Record<ItemCategory, { name: string, photoId: string }[]> = {
    "Electronics": [
        { name: "iPhone 15 Pro", photoId: "photo-1511707171634-5f897ff02aa9" },
        { name: "MacBook Air", photoId: "photo-1496181133206-80ce9b88a853" },
        { name: "Sony Headphones", photoId: "photo-1546435770-a3e426da473b" },
        { name: "AirPods Pro", photoId: "photo-1588449668365-d15e397f6787" },
        { name: "Nintendo Switch", photoId: "photo-1578303512597-81e6cc155b3e" },
        { name: "iPad Pro", photoId: "photo-1544244015-0cd613e51381" },
        { name: "Smart Watch", photoId: "photo-1523275335684-37898b6baf30" }
    ],
    "Personal Items": [
        { name: "Hermès Leather Wallet", photoId: "photo-1582139329536-e7284fece509" },
        { name: "18K Gold Cartier Wedding Ring", photoId: "photo-1583939003579-730e3918a45a" },
        { name: "Ray-Ban Wayfarer Sunglasses", photoId: "photo-1627123424574-724758594e93" },
        { name: "House Keys (Red Gucci Lanyard)", photoId: "photo-1582139329536-e7284fece509" },
        { name: "Montblanc Fountain Pen", photoId: "photo-1583485088034-697b5bc54ccd" },
        { name: "Tiffany & Co. Necklace", photoId: "photo-1599643478518-a784e5dc4c8f" },
        { name: "Rolex Submariner (Silver)", photoId: "photo-1523170335258-f5ed11844a49" },
        { name: "Personal Diary (Black Moleskine)", photoId: "photo-1511376777868-611b54f68947" },
        { name: "Rimowa Suitcase (Silver)", photoId: "photo-1553531384-cc64ac80f931" },
        { name: "Parker Jotter Pen", photoId: "photo-1583485088034-697b5bc54ccd" }
    ],
    "Pets & Animals": [
        { name: "Golden Retriever (Buddy)", photoId: "photo-1552053831-71594a27632d" },
        { name: "Black Shorthair Cat (Luna)", photoId: "photo-1543852786-1cf6624b9987" },
        { name: "Siberian Husky (Max)", photoId: "photo-1583511655857-d19b40a7a54e" },
        { name: "French Bulldog (Milo)", photoId: "photo-1517849845537-4d757902286a" },
        { name: "Orange Tabby Cat (Oliver)", photoId: "photo-1514888286974-6c03e2ca1dba" },
        { name: "Parakeet (Blue Feathered)", photoId: "photo-1522858547137-f1dce554f55f" },
        { name: "Beagle Puppy (Cooper)", photoId: "photo-1537151608828-ea2b11777ee8" },
        { name: "Main Coon Cat", photoId: "photo-1533738363-b7f9aef128ce" },
        { name: "Border Collie (Luna)", photoId: "photo-1503256207526-0d5d80fa2f47" },
        { name: "Siamese Cat", photoId: "photo-1513245543132-31f507417b26" }
    ],
    "Documents": [
        { name: "Passport (European Union)", photoId: "photo-1544396821-4dd40b938ad3" },
        { name: "New York Driver's License", photoId: "photo-1633613286848-e6f43bbafb8d" },
        { name: "University Student Card", photoId: "photo-1544396821-4dd40b938ad3" },
        { name: "Blue Business Folder", photoId: "photo-1544396821-4dd40b938ad3" },
        { name: "Immigration Papers", photoId: "photo-1633613286848-e6f43bbafb8d" },
        { name: "Birth Certificate Folder", photoId: "photo-1544396821-4dd40b938ad3" },
        { name: "Tax Audit Documents", photoId: "photo-1633613286848-e6f43bbafb8d" }
    ],
    "Apparel": [
        { name: "Black North Face Puffer", photoId: "photo-1591047139829-d91aecb6caea" },
        { name: "Nike Air Jordan 1 (Red/White)", photoId: "photo-1542291026-7eec264c27ff" },
        { name: "Cashmere Woolen Scarf", photoId: "photo-1591047139829-d91aecb6caea" },
        { name: "Patagonia Quarter Zip (Navy)", photoId: "photo-1523381210434-271e8be1f52b" },
        { name: "Designer Baseball Cap", photoId: "photo-1588850567047-18797b5b08b1" },
        { name: "Burberry Raincoat", photoId: "photo-1445205170230-053b830c6050" },
        { name: "Adidas Ultraboost (White)", photoId: "photo-1542291026-7eec264c27ff" },
        { name: "Canada Goose Parka", photoId: "photo-1591047139829-d91aecb6caea" },
        { name: "Levi's Denim Jacket", photoId: "photo-1521223890158-f9f7c3d5bab3" },
        { name: "Yeezy Boost 350", photoId: "photo-1542291026-7eec264c27ff" }
    ],
    "Other": [
        { name: "Acoustic Guitar", photoId: "photo-1550291652-6ea9114a47b1" },
        { name: "Steel Bottle", photoId: "photo-1602143399827-70349b10461f" },
        { name: "Umbrella", photoId: "photo-1510127034890-ba27508e9f1c" },
        { name: "Tennis Racket", photoId: "photo-1532619675605-1fea6d25208b" }
    ]
};

const LOCATIONS = [
    { name: "Times Square, NYC", lat: 40.7580, lng: -73.9855 },
    { name: "Piccadilly Circus, London", lat: 51.5101, lng: -0.1342 },
    { name: "Shibuya Crossing, Tokyo", lat: 35.6595, lng: 139.7005 },
    { name: "Eiffel Tower, Paris", lat: 48.8584, lng: 2.2945 },
    { name: "Opera House, Sydney", lat: -33.8568, lng: 151.2153 },
    { name: "Burj Khalifa, Dubai", lat: 25.1972, lng: 55.2744 },
    { name: "Brandenburg Gate, Berlin", lat: 52.5163, lng: 13.3777 },
    { name: "Gateway of India, Mumbai", lat: 18.9220, lng: 72.8347 },
    { name: "Christ the Redeemer, Rio", lat: -22.9519, lng: -43.2105 },
    { name: "Table Mountain, Cape Town", lat: -33.9628, lng: 18.4098 },
    { name: "Hollywood Sign, LA", lat: 34.1341, lng: -118.3215 },
    { name: "CN Tower, Toronto", lat: 43.6426, lng: -79.3871 },
    { name: "Marina Bay Sands, Singapore", lat: 1.2836, lng: 103.8607 },
    { name: "Zocalo, Mexico City", lat: 19.4326, lng: -99.1332 },
    { name: "Colosseum, Rome", lat: 41.8902, lng: 12.4922 },
    { name: "Red Square, Moscow", lat: 55.7539, lng: 37.6208 },
    { name: "Forbidden City, Beijing", lat: 39.9163, lng: 116.3972 },
    { name: "Table Mountain, Cape Town", lat: -33.9628, lng: 18.4098 }
];

export const generateMockUsers = (count: number): User[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `gen_user_${i}`,
        email: `user${i}@example.com`,
        name: NAMES[i % NAMES.length],
        role: "user",
        avatar: `https://i.pravatar.cc/150?u=gen_user_${i}`,
        trustScore: Math.floor(Math.random() * 20) + 80,
        itemsReported: Math.floor(Math.random() * 5),
        itemsFound: Math.floor(Math.random() * 3),
        isVerified: Math.random() > 0.7,
        xp: Math.floor(Math.random() * 500),
        level: 1,
        rank: "Rookie Finder",
        createdAt: new Date().toISOString()
    }));
};

export const generateMockItems = (count: number, users: User[]): Item[] => {
    // Create a flat pool of all possible item definitions
    const pooledItems: { category: ItemCategory, name: string, photoId: string }[] = [];
    Object.entries(ITEM_DATA).forEach(([category, items]) => {
        items.forEach(item => {
            pooledItems.push({ category: category as ItemCategory, ...item });
        });
    });

    // Shuffle the pool for randomness
    const shuffledPool = [...pooledItems].sort(() => Math.random() - 0.5);

    return Array.from({ length: count }).map((_, i) => {
        const type = Math.random() > 0.5 ? "lost" : "found";

        // Pick from shuffled pool to ensure uniqueness within the available data
        // If count > pooledItems.length, we will start repeating, but 100 items and a large pool is fine
        const itemInfo = shuffledPool[i % shuffledPool.length];
        const category = itemInfo.category;

        const locationBase = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const user = users[Math.floor(Math.random() * users.length)];

        // Generate verified Unsplash full URLs with parameters
        const photoUrl = `https://images.unsplash.com/${itemInfo.photoId}?auto=format&fit=crop&w=800&q=80`;

        // Add a small jitter to coordinates around the base city
        const lat = locationBase.lat + (Math.random() - 0.5) * 0.2;
        const lng = locationBase.lng + (Math.random() - 0.5) * 0.2;

        const base = {
            id: `gen_item_${i}`,
            title: `${type === "lost" ? "Lost" : "Found"}: ${itemInfo.name}`,
            description: type === "lost"
                ? `I unfortunately lost my ${itemInfo.name} yesterday afternoon around ${locationBase.name}. It has immense sentimental value to me. If you happened to pick it up or saw it, please let me know. I've already filed a report with the local authorities but hoping this protocol finds it faster.`
                : `I found a ${itemInfo.name} lying on a bench near ${locationBase.name} earlier today. It seems to be in good condition. If you are the owner, please describe any specific markings or the wallpaper/contents so I can verify it's yours. I really want to ensure this returns to its rightful owner as soon as possible.`,
            category,
            locationName: locationBase.name,
            locationLat: lat,
            locationLng: lng,
            date: new Date(Date.now() - Math.random() * 15552000000).toISOString(), // Up to 6 months
            photoUrl: photoUrl,
            status: "Reported" as const,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            userTrustScore: user.trustScore,
            createdAt: new Date(Date.now() - Math.random() * 15552000000).toISOString(), // Up to 6 months
            likesCount: Math.floor(Math.random() * 150) + 10,
            commentsCount: Math.floor(Math.random() * 8),
            userHasLiked: Math.random() > 0.85,
            verificationQuestion: type === "lost"
                ? "Can you describe the specific protective case or any unique scratches on the surface?"
                : "Can you confirm the Lock Screen wallpaper or identify the items inside/contents of the folder?"
        };

        if (type === "lost") {
            return {
                ...base,
                type: "lost"
            } as Item;
        } else {
            return {
                ...base,
                type: "found"
            } as Item;
        }
    });
};

