export type FeedItem = {
    id: string;
    user: string;
    role: string;
    time: string;
    content: string;
    vendorId: string;
    vendorName: string;
    vendorCategory: string;
    likes: number;
    comments: number;
    avatar: string;
    vendorImage: string;
    photos: string[];
    likedByMe: boolean;
};

export type FeedResponse = FeedItem[];