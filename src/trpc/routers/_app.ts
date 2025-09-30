import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { inngest } from "@/inngest/client";
import { MessagesRouter } from "@/modules/messages/server/procedures";
import { ProjectsRouter } from "@/modules/projects/server/procedures";
export const appRouter = createTRPCRouter({
  messages: MessagesRouter,
  projects: ProjectsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
