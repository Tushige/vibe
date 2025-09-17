"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
export default function ClientHome() {
  const trpc = useTRPC();

  return <div className="font-sans "></div>;
}
