// constants/vendors.ts

export type Vendor = {
    id: number;
    name: string;
    category: string;
    description: string;
    location: string;
    latitude: number;
    longitude: number;
    distance: number;
    rating: number;
    reviewsCount: number;
    isOpen: boolean;
    isVerified: boolean;
    claimed: boolean;
    image: string;
    phone: string;
    hours: string;
};

export const vendors: Vendor[] = [
    {
        id: 1,
        name: "Mama Mary's Kitchen",
        category: "Food",
        description:
            "Authentic homemade meals and traditional favourites prepared fresh every day.",
        location: "Braamfontein, Johannesburg",
        latitude: -26.1919,
        longitude: 28.0341,
        distance: 350,
        rating: 4.8,
        reviewsCount: 126,
        isOpen: true,
        isVerified: true,
        claimed: false,
        image:
            "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
        phone: "+27 71 234 5678",
        hours: "07:00 - 18:00",
    },
    {
        id: 2,
        name: "Sipho Fresh Produce",
        category: "Fresh Produce",
        description:
            "Fresh fruit and vegetables sourced from local farmers and sold at affordable prices.",
        location: "Braamfontein, Johannesburg",
        latitude: -26.1946,
        longitude: 28.0407,
        distance: 640,
        rating: 4.6,
        reviewsCount: 74,
        isOpen: true,
        isVerified: false,
        claimed: true,
        image:
            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
        phone: "+27 72 345 6789",
        hours: "06:30 - 17:00",
    },
    {
        id: 3,
        name: "King's Cut Barber",
        category: "Barber",
        description:
            "Professional cuts, fades and grooming services from experienced local barbers.",
        location: "Braamfontein, Johannesburg",
        latitude: -26.1885,
        longitude: 28.0400,
        distance: 900,
        rating: 4.9,
        reviewsCount: 208,
        isOpen: true,
        isVerified: true,
        claimed: false,
        image:
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
        phone: "+27 73 456 7890",
        hours: "08:00 - 19:00",
    },
    {
        id: 4,
        name: "Vusi Airtime & Accessories",
        category: "Accessories",
        description:
            "Airtime, data, phone accessories and everyday mobile essentials.",
        location: "Braamfontein, Johannesburg",
        latitude: -26.2028,
        longitude: 28.0341,
        distance: 1200,
        rating: 4.5,
        reviewsCount: 52,
        isOpen: true,
        isVerified: false,
        claimed: true,
        image:
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
        phone: "+27 74 567 8901",
        hours: "08:00 - 18:00",
    },
    {
        id: 5,
        name: "Sello Shoe Repairs",
        category: "Repairs",
        description:
            "Affordable shoe repairs, restoration and maintenance for all types of footwear.",
        location: "Braamfontein, Johannesburg",
        latitude: -26.2074,
        longitude: 28.0225,
        distance: 1800,
        rating: 4.7,
        reviewsCount: 89,
        isOpen: true,
        isVerified: true,
        claimed: false,
        image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        phone: "+27 75 678 9012",
        hours: "08:30 - 17:30",
    },
    {
        id: 6,
        name: "Sparkle Mobile Car Wash",
        category: "Car Wash",
        description:
            "Convenient mobile car wash services brought directly to your location.",
        location: "Braamfontein, Johannesburg",
        latitude: -26.1946,
        longitude: 28.0175,
        distance: 2300,
        rating: 4.4,
        reviewsCount: 41,
        isOpen: false,
        isVerified: false,
        claimed: true,
        image:
            "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80",
        phone: "+27 76 789 0123",
        hours: "08:00 - 17:00",
    },
];

export const categories = [
    "All",
    "Food",
    "Fresh Produce",
    "Clothing",
    "Barber",
    "Repairs",
    "Car Wash",
    "Accessories",
];

export const distanceOptions = [
    "500 m",
    "1 km",
    "10 km",
];