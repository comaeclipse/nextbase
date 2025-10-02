"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import {
  createDestination,
  deleteDestination,
  updateDestination,
} from "@/lib/destination-store";
import { ADMIN_COOKIE } from "./shared";
import type { ActionResult } from "./shared";
import type { Destination, FirearmLaw, GovernorParty, MarijuanaStatus } from "@/types/destination";

const GOVERNOR_PARTIES: GovernorParty[] = ["democrat", "republican", "independent", "nonpartisan"];
const MARIJUANA_STATUSES: MarijuanaStatus[] = ["recreational", "medical", "decriminalized", "illegal"];
const FIREARM_LAWS: FirearmLaw[] = ["permissive", "moderate", "restrictive"];

function adminToken() {
  return process.env.ADMIN_DASHBOARD_TOKEN ?? "";
}

async function isAuthorized() {
  const token = adminToken();
  if (!token) {
    return false;
  }
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(ADMIN_COOKIE)?.value ?? "";
  return cookieToken === token;
}

function unauthorizedResult(): ActionResult {
  return {
    success: false,
    message: "Unauthorized request.",
  };
}

function parseRequiredString(label: string, value: FormDataEntryValue | null) {
  const parsed = value?.toString().trim() ?? "";
  if (!parsed) {
    throw new Error(`${label} is required.`);
  }
  return parsed;
}

function parseNumber(label: string, value: FormDataEntryValue | null) {
  const raw = value?.toString().trim() ?? "";
  if (!raw) {
    throw new Error(`${label} is required.`);
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a valid number.`);
  }
  return parsed;
}

function parseEnum<T extends string>(label: string, value: FormDataEntryValue | null, options: readonly T[]): T {
  const parsed = value?.toString().trim().toLowerCase() as T | undefined;
  if (!parsed) {
    throw new Error(`${label} is required.`);
  }
  if (!options.includes(parsed)) {
    throw new Error(`${label} must be one of: ${options.join(", ")}.`);
  }
  return parsed;
}

function toDestination(formData: FormData): Destination {
  return {
    id: parseRequiredString("ID", formData.get("id")),
    city: parseRequiredString("City", formData.get("city")),
    state: parseRequiredString("State", formData.get("state")),
    governorName: parseRequiredString("Governor name", formData.get("governorName")),
    governorParty: parseEnum("Governor party", formData.get("governorParty"), GOVERNOR_PARTIES),
    salesTax: parseNumber("Sales tax", formData.get("salesTax")),
    incomeTax: parseNumber("Income tax", formData.get("incomeTax")),
    marijuanaStatus: parseEnum("Marijuana status", formData.get("marijuanaStatus"), MARIJUANA_STATUSES),
    firearmLaws: parseEnum("Firearm laws", formData.get("firearmLaws"), FIREARM_LAWS),
    veteranBenefits: parseRequiredString("Veteran benefits", formData.get("veteranBenefits")),
    climate: parseRequiredString("Climate", formData.get("climate")),
    snowfall: parseNumber("Average snowfall", formData.get("snowfall")),
    rainfall: parseNumber("Average rainfall", formData.get("rainfall")),
    gasPrice: parseNumber("Gas price", formData.get("gasPrice")),
    costOfLiving: parseNumber("Cost of living", formData.get("costOfLiving")),
  };
}

export async function authenticateAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const provided = formData.get("token")?.toString().trim() ?? "";
  const token = adminToken();

  if (!token) {
    return {
      success: false,
      message: "ADMIN_DASHBOARD_TOKEN is not configured.",
    };
  }

  const cookieStore = await cookies();

  if (provided !== token) {
    cookieStore.delete(ADMIN_COOKIE);
    return {
      success: false,
      message: "Invalid token.",
    };
  }

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  revalidatePath("/admin");

  return {
    success: true,
    message: "Signed in successfully.",
  };
}

export async function signOutAction(formData: FormData): Promise<void> {
  void formData;
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  revalidatePath("/admin");
}

export async function createDestinationAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await isAuthorized())) {
    return unauthorizedResult();
  }

  try {
    const destination = toDestination(formData);
    await createDestination(destination);
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: "Failed to create destination.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/");

  return {
    success: true,
    message: "Destination created.",
  };
}

export async function updateDestinationAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await isAuthorized())) {
    return unauthorizedResult();
  }

  const id = formData.get("id")?.toString().trim() ?? "";

  if (!id) {
    return {
      success: false,
      message: "Missing destination ID.",
    };
  }

  try {
    const destination = toDestination(formData);
    await updateDestination(id, destination);
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: "Failed to update destination.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/");

  return {
    success: true,
    message: "Destination updated.",
  };
}

export async function deleteDestinationAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await isAuthorized())) {
    return unauthorizedResult();
  }

  const id = formData.get("id")?.toString().trim() ?? "";

  if (!id) {
    return {
      success: false,
      message: "Missing destination ID.",
    };
  }

  try {
    await deleteDestination(id);
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: "Failed to delete destination.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/");

  return {
    success: true,
    message: "Destination deleted.",
  };
}
