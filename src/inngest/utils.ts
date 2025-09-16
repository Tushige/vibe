import Sandbox from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandboxId: string) {
  if (!sandboxId) {
    throw Error("[getSandbox] sandboxId is a required field");
  }
  const sandbox = await Sandbox.connect(sandboxId);
  return sandbox;
}

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant"
  );
  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;
  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined;
}
