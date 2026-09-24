// constants/feed.ts

export type FeedItem = {
    id: number;
    user: string;
    role: string;
    time: string;
    content: string;
    vendorName: string;
    vendorCategory: string;
    likes: number;
    comments: number;
    avatar: string;
    vendorImage: string;
};

export const feedItems: FeedItem[] = [
    {
        id: 1,
        user: "Thabo M.",
        role: "Community Scout",
        time: "15m ago",
        content: "Just discovered this amazing local spot!",
        vendorName: "Auntie Joyce Vetkoek",
        vendorCategory: "Food",
        likes: 24,
        comments: 5,
        avatar: "TM",
        vendorImage:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 2,
        user: "Nomusa K.",
        role: "Local Explorer",
        time: "2h ago",
        content: "King's Cut never disappoints 🔥",
        vendorName: "King's Cut Barber",
        vendorCategory: "Barber",
        likes: 42,
        comments: 8,
        avatar: "NK",
        vendorImage:
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 3,
        user: "Sipho N.",
        role: "Vendor Rep",
        time: "5h ago",
        content: "Fresh stock just arrived! 🍎🥬",
        vendorName: "Sipho Fresh Produce",
        vendorCategory: "Fresh Produce",
        likes: 67,
        comments: 12,
        avatar: "SN",
        vendorImage:
            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    },
];