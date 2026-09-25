import kota from "@/assets/vendor-kota.jpg";
import barber from "@/assets/vendor-barber.jpg";
import carwash from "@/assets/vendor-carwash.jpg";
import produce from "@/assets/vendor-produce.jpg";

export const vendorImages = { kota, barber, carwash, produce };

export type VendorStatus =
  | "Community added"
  | "Pending"
  | "Vendor claimed"
  | "Verified"
  | "Suspended";

export type Vendor = {
  id: string;
  name: string;
  category: string;
  area: string;
  status: VendorStatus;
  rating: number;
  reviews: number;
  updated: string;
  addedBy: string;
  image: string;
};

export const vendors: Vendor[] = [
  {
    id: "v-101",
    name: "Kasi Fresh Produce",
    category: "Fresh produce",
    area: "Soweto, Orlando West",
    status: "Verified",
    rating: 4.7,
    reviews: 182,
    updated: "2h",
    addedBy: "@lebo_",
    image: produce,
  },
  {
    id: "v-102",
    name: "Mama Noms' Kota",
    category: "Kota stall",
    area: "12 Durban Road, Germiston",
    status: "Pending",
    rating: 4.8,
    reviews: 94,
    updated: "3h",
    addedBy: "@lebo_",
    image: kota,
  },
  {
    id: "v-103",
    name: "Ntusi Barbers",
    category: "Barber",
    area: "1201 King William St, East London",
    status: "Vendor claimed",
    rating: 4.5,
    reviews: 61,
    updated: "1d",
    addedBy: "@sipho.k",
    image: barber,
  },
  {
    id: "v-104",
    name: "Bottelash Car Wash",
    category: "Car wash",
    area: "88 Nelson Mandela Dr, Durban",
    status: "Community added",
    rating: 4.1,
    reviews: 23,
    updated: "2d",
    addedBy: "@nandi.z",
    image: carwash,
  },
  {
    id: "v-105",
    name: "Soweto Sisa Grill",
    category: "Kota stall",
    area: "Vilakazi St, Soweto",
    status: "Suspended",
    rating: 3.2,
    reviews: 47,
    updated: "4d",
    addedBy: "@thabo.m",
    image: kota,
  },
  {
    id: "v-106",
    name: "Green Hands Veggies",
    category: "Fresh produce",
    area: "Marabastad, Pretoria",
    status: "Verified",
    rating: 4.6,
    reviews: 138,
    updated: "5d",
    addedBy: "@zanele",
    image: produce,
  },
  {
    id: "v-107",
    name: "Sharp Blade Fades",
    category: "Barber",
    area: "Mbombela taxi rank",
    status: "Pending",
    rating: 4.4,
    reviews: 12,
    updated: "6d",
    addedBy: "@katlego",
    image: barber,
  },
  {
    id: "v-108",
    name: "Bubble City Wash",
    category: "Car wash",
    area: "Polokwane CBD",
    status: "Community added",
    rating: 3.9,
    reviews: 8,
    updated: "1w",
    addedBy: "@refilwe",
    image: carwash,
  },
];

export type QueueItem = {
  id: string;
  name: string;
  category: string;
  area: string;
  addedBy: string;
  age: string;
  image: string;
  checks: { label: string; ok: boolean }[];
  claimant: string;
  note: string;
};

export const verificationQueue: QueueItem[] = [
  {
    id: "q-1",
    name: "Mama Noms' Kota",
    category: "Kota stall",
    area: "12 Durban Road, Germiston",
    addedBy: "@lebo_",
    age: "3h ago",
    image: kota,
    checks: [
      { label: "3 photos", ok: true },
      { label: "ID match", ok: true },
      { label: "GPS ok", ok: true },
    ],
    claimant: "Nomsa Dlamini",
    note: "Trades daily next to the taxi rank. Claim submitted with ID and stall photo.",
  },
  {
    id: "q-2",
    name: "Sharp Blade Fades",
    category: "Barber",
    area: "Mbombela taxi rank",
    addedBy: "@katlego",
    age: "5h ago",
    image: barber,
    checks: [
      { label: "2 photos", ok: true },
      { label: "ID pending", ok: false },
      { label: "GPS ok", ok: true },
    ],
    claimant: "Sifiso Nkosi",
    note: "Claimant phone number matches the listing contact.",
  },
  {
    id: "q-3",
    name: "Bubble City Wash",
    category: "Car wash",
    area: "Polokwane CBD",
    addedBy: "@refilwe",
    age: "1d ago",
    image: carwash,
    checks: [
      { label: "1 photo", ok: true },
      { label: "ID match", ok: true },
      { label: "GPS drift", ok: false },
    ],
    claimant: "Peter Mahlangu",
    note: "Pinned location is 400 m from the photos — request a location confirmation.",
  },
  {
    id: "q-4",
    name: "Green Hands Veggies",
    category: "Fresh produce",
    area: "Marabastad, Pretoria",
    addedBy: "@zanele",
    age: "1d ago",
    image: produce,
    checks: [
      { label: "4 photos", ok: true },
      { label: "ID match", ok: true },
      { label: "GPS ok", ok: true },
    ],
    claimant: "Zodwa Mabaso",
    note: "Second claim on this listing — first claimant withdrew.",
  },
];

export const categories = [
  { key: "K", name: "Kota stall", count: 214, tone: "ember" as const },
  { key: "F", name: "Fresh produce", count: 189, tone: "moss" as const },
  { key: "B", name: "Barber", count: 96, tone: "ink" as const },
  { key: "C", name: "Car wash", count: 72, tone: "amber" as const },
  { key: "S", name: "Shebeen", count: 58, tone: "clay" as const },
  { key: "P", name: "Phone accessories", count: 51, tone: "ink" as const },
  { key: "R", name: "Repairs", count: 44, tone: "moss" as const },
  { key: "T", name: "Clothing & textiles", count: 39, tone: "ember" as const },
];

export type ReportKind = "Flag" | "Review" | "Resolved";

export const reports = [
  {
    id: "r-1",
    kind: "Flag" as ReportKind,
    title: "Soweto Sisa Grill — reported listing",
    detail: "Closed 3 days ago · reported by 2 users",
    priority: "High",
  },
  {
    id: "r-2",
    kind: "Review" as ReportKind,
    title: "Kasi Fresh Produce — flagged review",
    detail: '"Closed without notice" · disputed by vendor',
    priority: "High",
  },
  {
    id: "r-3",
    kind: "Review" as ReportKind,
    title: "Ntusi Barbers — price dispute",
    detail: "111 Main Rd · photo mismatch",
    priority: "Normal",
  },
  {
    id: "r-4",
    kind: "Flag" as ReportKind,
    title: "Bubble City Wash — wrong location",
    detail: "Pin 400 m off · reported by 3 users",
    priority: "High",
  },
  {
    id: "r-5",
    kind: "Review" as ReportKind,
    title: "Green Hands Veggies — suspected fake review",
    detail: "5 five-star reviews from one device",
    priority: "Normal",
  },
  {
    id: "r-6",
    kind: "Resolved" as ReportKind,
    title: "Bottelash Car Wash — duplicate listing",
    detail: "merged into primary · 6d ago",
    priority: "Done",
  },
];

export type Member = {
  id: string;
  handle: string;
  name: string;
  role: "Customer" | "Vendor" | "Inspector";
  level: string;
  points: number;
  added: number;
  reviews: number;
  joined: string;
  status: "Active" | "Suspended";
};

export const members: Member[] = [
  {
    id: "u-1",
    handle: "@lebo_",
    name: "Lebo Mokoena",
    role: "Customer",
    level: "Community Builder",
    points: 1840,
    added: 26,
    reviews: 71,
    joined: "Mar 2026",
    status: "Active",
  },
  {
    id: "u-2",
    handle: "@nomsa.d",
    name: "Nomsa Dlamini",
    role: "Vendor",
    level: "Explorer",
    points: 240,
    added: 1,
    reviews: 3,
    joined: "Jun 2026",
    status: "Active",
  },
  {
    id: "u-3",
    handle: "@thabo.m",
    name: "Thabo Mahlangu",
    role: "Inspector",
    level: "Ngila Ambassador",
    points: 4120,
    added: 52,
    reviews: 118,
    joined: "Jan 2026",
    status: "Active",
  },
  {
    id: "u-4",
    handle: "@nandi.z",
    name: "Nandi Zulu",
    role: "Customer",
    level: "Contributor",
    points: 760,
    added: 9,
    reviews: 28,
    joined: "May 2026",
    status: "Active",
  },
  {
    id: "u-5",
    handle: "@fake.acct",
    name: "Unverified account",
    role: "Customer",
    level: "Explorer",
    points: 30,
    added: 4,
    reviews: 19,
    joined: "Sep 2026",
    status: "Suspended",
  },
  {
    id: "u-6",
    handle: "@katlego",
    name: "Katlego Sithole",
    role: "Customer",
    level: "Contributor",
    points: 612,
    added: 7,
    reviews: 22,
    joined: "Apr 2026",
    status: "Active",
  },
];

export const stats = [
  { label: "Total vendors", value: "1,284", note: "▲ 42 this week", tone: "moss" as const },
  { label: "Community added", value: "861", note: "67% of total", tone: "mute" as const },
  { label: "Pending verification", value: "14", note: "2 due today", tone: "ember" as const, alert: true },
  { label: "Active users", value: "9,406", note: "▲ 8% week on week", tone: "moss" as const },
  { label: "Reports open", value: "6", note: "3 high priority", tone: "clay" as const, alert: true },
];

export const weeklyAdds = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 36 },
  { day: "Thu", value: 71 },
  { day: "Fri", value: 88 },
  { day: "Sat", value: 64 },
  { day: "Sun", value: 49 },
];

export const activity = [
  { who: "@lebo_", what: "added Mama Noms' Kota", when: "3h ago", tone: "ember" as const },
  { who: "Thabo M.", what: "verified Kasi Fresh Produce", when: "5h ago", tone: "moss" as const },
  { who: "@nandi.z", what: "reported a duplicate listing", when: "8h ago", tone: "clay" as const },
  { who: "Nomsa D.", what: "claimed Mama Noms' Kota", when: "1d ago", tone: "amber" as const },
  { who: "@katlego", what: "uploaded 3 stall photos", when: "1d ago", tone: "ink" as const },
];
