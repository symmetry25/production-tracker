import { ProjectSubNav } from "@/components/layout/project-sub-nav";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<unknown>;
}) {
  const { projectId } = (await params) as { projectId: string };
  const locale = await getLocale();

  return (
    <>
      <ProjectSubNav projectId={projectId} labels={getDictionary(locale).shell.projectTabs} />
      {children}
    </>
  );
}
