import kota from "@/assets/vendor-kota.jpg";
import barber from "@/assets/vendor-barber.jpg";
import carwash from "@/assets/vendor-carwash.jpg";
import produce from "@/assets/vendor-produce.jpg";

// Fallback thumbnails for vendors that have no ImageUrl set on the backend.
export const vendorImages = { kota, barber, carwash, produce };
export const fallbackVendorImage = produce;
