"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

function Home() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (res) => {
        if (res.ok == "success") {
          const { data } = res;
          router.push(`/projects/${data.id}`);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center flex-col gap-y-4 justify-center">
        <input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button
          disabled={createProject.isPending}
          onClick={() => createProject.mutate({ value })}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
export default Home;
