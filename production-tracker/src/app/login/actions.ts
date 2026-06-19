"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/app",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "邮箱或密码不正确。当前本地演示账号是 admin@studio.com / admin123。" };
    }

    throw error;
  }

  return {};
}

export async function googleLoginAction() {
  await signIn("google", { redirectTo: "/app" });
}
