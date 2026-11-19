import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectView } from "@/components/ProjectView";

export const metadata: Metadata = {
  title: "Ton projet — ViceClip",
  robots: { index: false },
};

async function Project({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectView id={id} />;
}

export default function ProjectPage({ params }: PageProps<"/projets/[id]">) {
  return (
    <Suspense fallback={null}>
      <Project params={params} />
    </Suspense>
  );
}
