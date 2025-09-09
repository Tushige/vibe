
'use client'

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

function Home() {
  const trpc = useTRPC()
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () => {
      console.log('*** Invoke SUccess!')
      toast.success('Background Job Started!')
    }
  }))
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({text: "test@gmail.com"})}>Invoke Background Job</Button>
    </div>
  )
}
export default Home;