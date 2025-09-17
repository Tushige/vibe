"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

function Home() {
  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success("Background Job Started!");
      },
    })
  );
  return (
    <div className="p-4 max-w-7xl mx-auto flex flex-col gap-4">
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        disabled={createMessage.isPending}
        onClick={() => createMessage.mutate({ value })}
      >
        Invoke Background Job
      </Button>
    </div>
  );
}
export default Home;
