import Anthropic from "@anthropic-ai/sdk";
import { parseJsonFromModelText } from "@/lib/pro/agents/context";
import { areProAgentsEnabled } from "@/lib/pro/launch-flags";

/** Agents + Anthropic calls — requires PRO_AGENTS_ENABLED and API key. */
export function isClaudeAgentsConfigured(): boolean {
  return areProAgentsEnabled();
}

export function anthropicModel(): string {
  // Soft-launch / beta default: cheaper Haiku. Override with ANTHROPIC_MODEL for Sonnet quality.
  return process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-haiku-20241022";
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!isClaudeAgentsConfigured()) {
    throw new Error(
      "Native agents are off. Set PRO_AGENTS_ENABLED=1 and ANTHROPIC_API_KEY, or use local quick prep."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function callSubAgentJson<T>(
  system: string,
  user: string,
  maxTokens = 4096
): Promise<T> {
  const response = await getClient().messages.create({
    model: anthropicModel(),
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  return parseJsonFromModelText(extractText(response.content)) as T;
}

export type VisionImageInput = {
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  data: string;
};

/** Multimodal JSON agent call (reference stills, mood boards). */
export async function callSubAgentJsonWithImages<T>(
  system: string,
  userText: string,
  images: VisionImageInput[],
  maxTokens = 4096
): Promise<T> {
  const content: Anthropic.MessageParam["content"] = [
    ...images.map((img) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: img.mediaType,
        data: img.data,
      },
    })),
    { type: "text" as const, text: userText },
  ];

  const response = await getClient().messages.create({
    model: anthropicModel(),
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content }],
  });

  return parseJsonFromModelText(extractText(response.content)) as T;
}

function extractText(blocks: Anthropic.ContentBlock[]): string {
  return blocks
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
