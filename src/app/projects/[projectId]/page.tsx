import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { useTRPC } from "@/trpc/client";
import { getQueryClient, trpc } from "@/trpc/server";
import {
  dehydrate,
  HydrationBoundary,
  useMutation,
} from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Suspense, useState } from "react";

interface Props {
  params: Promise<{
    projectId: string;
  }>;
}

async function Page({ params }: Props) {
  const { projectId } = await params;
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  );

  void queryClient.prefetchQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>loading project view...</p>}>
        <ProjectView projectId={projectId} />
      </Suspense>
    </HydrationBoundary>
  );
}
export default Page;
