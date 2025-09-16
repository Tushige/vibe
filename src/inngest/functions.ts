import { inngest } from "./client";
import {
  openai,
  createAgent,
  createTool,
  createNetwork,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import z from "zod";
import { PROMPT } from "@/prompt";

// Schema for the terminal command input
const terminalInputSchema = z.object({
  command: z.string().describe("The terminal command to execute"),
  workingDirectory: z
    .string()
    .optional()
    .describe("Optional working directory to run the command in"),
  timeout: z
    .number()
    .optional()
    .default(30000)
    .describe("Timeout in milliseconds (default: 30s)"),
});

const createOrUpdateSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});
const readSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
    })
  ),
});
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-test-nextjs-minner775");
      if (!sandbox || !sandbox.sandboxId) {
        console.error("[functions] sandboxId not found");
      }
      return sandbox.sandboxId;
    });
    // Create a new agent with a system prompt (you can add optional tools, too)
    const codeAgent = createAgent({
      name: "code-agent",
      description: "An Expert coding agent",
      system: PROMPT,
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "use the terminal to run commands.",
          parameters: terminalInputSchema,
          handler: async ({ command, workingDirectory, timeout }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (err) {
                const errString = `Command failed: ${err} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
                console.error(errString);
                return errString;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFile",
          description: "Create or Update files in the sandbox",
          parameters: createOrUpdateSchema,
          handler: async ({ files }, { step, network }) => {
            const result = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return { success: true, files: updatedFiles };
              } catch (err) {
                return "Error: " + err;
              }
            });
            if (result?.success) {
              network.state.data.files = result.files;
            } else {
              return result;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files in the sandbox",
          parameters: readSchema,
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (err) {
                return "Error: " + err;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 3,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }

        /**
         * if you return codeAgent, then codeAgent will call itself up to maxIter times and keep re-trying OR until we exit by detecting summary field as shown above.
         */
        return codeAgent;
      },
    });
    const result = await network.run(event.data.value);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `https://${host}`;
      } catch (err) {
        console.error(err);
      }
    });

    return {
      summary: result.state.data.summary,
      files: result.state.data.files,
      title: "fragment",
      url: sandboxUrl,
    };
  }
);
