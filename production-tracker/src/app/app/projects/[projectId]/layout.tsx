import { ProjectSubNav } from "@/components/layout/project-sub-nav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<unknown>;
}) {
  const { projectId } = (await params) as { projectId: string };

  return (
    <>
      <ProjectSubNav projectId={projectId} />
      {children}
    </>
  );
}
