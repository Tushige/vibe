import { generateSlug } from "random-word-slugs";
import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { TRPCError } from "@trpc/server";

export const ProjectsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "project id is required" }),
      })
    )
    .query(async ({ input }) => {
      const project = await prisma.project.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project ${input.id} not found!`,
        });
      }
      return project;
    }),
  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    return projects;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Prompt is required" })
          .max(10000, { message: "Prompt is too long" }),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[CREATE] input is ");
      console.log(input);
      console.log(input.value);
      try {
        const createdProject = await prisma.project.create({
          data: {
            name: generateSlug(2, {
              format: "kebab",
            }),
            messages: {
              create: {
                content: input.value,
                role: "USER",
                type: "RESULT",
              },
            },
          },
        });
        console.log("created project is ");
        console.log(createdProject);
        await inngest.send({
          name: "code-agent/run",
          data: {
            value: input.value,
            projectId: createdProject.id,
          },
        });
        return {
          ok: "success",
          project: createdProject,
        };
      } catch (err) {
        console.error(err);
        return {
          error: err,
        };
      }
    }),
});
