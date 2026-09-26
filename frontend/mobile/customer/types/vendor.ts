export type TradingHour = {
    day: string;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
};

export type Vendor = {
    id: string;
    name: string;
    categories: string[];
    description: string;
    location: string;
    distance: number;
    latitude: number | null;
    longitude: number | null;
    rating: number;
    reviewsCount: number;
    isOpen: boolean;
    isVerified: boolean;
    claimed: boolean;
    image: string | null;
    photos: string[];
    phone: string | null;
    tradingHours: TradingHour[];
};

export type VendorResponse = Vendor[];