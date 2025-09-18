"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  params: Promise<{
    projectId: string;
  }>;
}

async function ProjectPage({ params }: Props) {
  const { projectId } = await params;

  return <h1>Project: {projectID}</h1>;
}
export default ProjectPage;
