"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "./shared";
import type { ActionResult } from "./shared";

function adminToken() {
  return process.env.ADMIN_DASHBOARD_TOKEN ?? "";
}

function isAuthorized() {
  const token = adminToken();
  if (!token) {
    return false;
  }
  const cookieToken = cookies().get(ADMIN_COOKIE)?.value ?? "";
  return cookieToken === token;
}

function unauthorizedResult(): ActionResult {
  return {
    success: false,
    message: "Unauthorized request.",
  };
}

function parseCsv(value: FormDataEntryValue | null) {
  return (value?.toString() ?? "")
    .split(/,|\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseNumber(name: string, value: FormDataEntryValue | null) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${name} must be a valid number.`);
  }
  return parsed;
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

  if (provided !== token) {
    cookies().delete(ADMIN_COOKIE);
    return {
      success: false,
      message: "Invalid token.",
    };
  }

  cookies().set(ADMIN_COOKIE, token, {
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

export async function signOutAction(): Promise<ActionResult> {
  cookies().delete(ADMIN_COOKIE);
  revalidatePath("/admin");
  return {
    success: true,
    message: "Signed out.",
  };
}

export async function createDestinationAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized()) {
    return unauthorizedResult();
  }

  const id = formData.get("id")?.toString().trim() ?? "";
  const name = formData.get("name")?.toString().trim() ?? "";
  const state = formData.get("state")?.toString().trim() ?? "";
  const region = formData.get("region")?.toString().trim() ?? "";
  const techPresence = formData.get("techPresence")?.toString().trim() ?? "";
  const taxBand = formData.get("taxBand")?.toString().trim() ?? "";
  const gunLaws = formData.get("gunLaws")?.toString().trim() ?? "";
  const summary = formData.get("summary")?.toString().trim() ?? "";
  const heroImage = formData.get("heroImage")?.toString().trim() ?? "";

  if (!id || !name) {
    return {
      success: false,
      message: "ID and name are required.",
    };
  }

  try {
    const costOfLivingIndex = parseNumber("Cost of living index", formData.get("costOfLivingIndex"));
    const vaResourcesScore = parseNumber("VA resources score", formData.get("vaResourcesScore"));
    const healthcareIndex = parseNumber("Healthcare index", formData.get("healthcareIndex"));

    await prisma.destination.create({
      data: {
        id,
        name,
        state,
        region,
        climate: parseCsv(formData.get("climate")),
        lifestyle: parseCsv(formData.get("lifestyle")),
        highlights: parseCsv(formData.get("highlights")),
        techPresence,
        gunLaws,
        taxBand,
        costOfLivingIndex,
        vaResourcesScore,
        healthcareIndex,
        summary,
        heroImage,
      },
    });
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

export async function updateDestinationAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  if (!isAuthorized()) {
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
    const costOfLivingIndex = parseNumber("Cost of living index", formData.get("costOfLivingIndex"));
    const vaResourcesScore = parseNumber("VA resources score", formData.get("vaResourcesScore"));
    const healthcareIndex = parseNumber("Healthcare index", formData.get("healthcareIndex"));

    await prisma.destination.update({
      where: { id },
      data: {
        name: formData.get("name")?.toString().trim() ?? "",
        state: formData.get("state")?.toString().trim() ?? "",
        region: formData.get("region")?.toString().trim() ?? "",
        climate: parseCsv(formData.get("climate")),
        lifestyle: parseCsv(formData.get("lifestyle")),
        highlights: parseCsv(formData.get("highlights")),
        techPresence: formData.get("techPresence")?.toString().trim() ?? "",
        gunLaws: formData.get("gunLaws")?.toString().trim() ?? "",
        taxBand: formData.get("taxBand")?.toString().trim() ?? "",
        costOfLivingIndex,
        vaResourcesScore,
        healthcareIndex,
        summary: formData.get("summary")?.toString().trim() ?? "",
        heroImage: formData.get("heroImage")?.toString().trim() ?? "",
      },
    });
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

export async function deleteDestinationAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  if (!isAuthorized()) {
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
    await prisma.destination.delete({ where: { id } });
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


