import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell session={session} locale={locale} dictionary={getDictionary(locale)}>
      {children}
    </AppShell>
  );
}
