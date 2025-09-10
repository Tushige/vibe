import { inngest } from "./client";
import { openai, createAgent } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {

    // Create a new agent with a system prompt (you can add optional tools, too)
    const summarizer = createAgent({
      name: "summarizer",
      system: "You are an expert summarizer. You summarize in 3 words.",
      model: openai({ model: "gpt-4o" }),
    });

    // Run the agent with an input.  This automatically uses steps
    // to call your AI model.
    const { output } = await summarizer.run(`summarize the following text: ${event.data.value}`);
    console.log(output)
    return {
      success: 'ok'
    }
  }
);