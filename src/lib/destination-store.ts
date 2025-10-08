import type { Destination } from "@/types/destination";

// Import Postgres implementation
export { loadDestinations, createDestination, updateDestination, deleteDestination } from "./destination-store-postgres";
