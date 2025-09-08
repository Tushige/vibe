
'use client'
import { useTRPC } from "@/trpc/client";
import {  useSuspenseQuery } from "@tanstack/react-query";
export default function ClientHome() {
  const trpc = useTRPC();
  const {data} = useSuspenseQuery(trpc.hello.queryOptions({text: 'hello world'}))

  return (
    <div className="font-sans ">
      {JSON.stringify(data)}
    </div>
  );
}
