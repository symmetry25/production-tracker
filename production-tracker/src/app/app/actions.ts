"use server";

import { cookies } from "next/headers";

import { signOut } from "@/auth";
import { getNextLocale, localeCookieName, type Locale } from "@/lib/i18n";

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function switchLocaleAction(formData: FormData) {
  const currentLocale = formData.get("locale") === "en" ? "en" : "zh";
  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, getNextLocale(currentLocale as Locale), {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
