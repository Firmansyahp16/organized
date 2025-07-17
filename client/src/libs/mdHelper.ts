import { uniqueId } from "lodash";

export type Block =
  | { id: string; type: "heading"; value: string }
  | { id: string; type: "paragraph"; value: string }
  | { id: string; type: "list"; value: string[] }
  | { id: string; type: "link"; value: string; url: string };

export function serializeMarkdown(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (b.type === "heading") return `## ${b.value}`;
      if (b.type === "paragraph") return b.value;
      if (b.type === "list")
        return b.value.map((item) => `- ${item}`).join("\n");
      if (b.type === "link") return `[${b.value}](${b.url})`;
      return "";
    })
    .join("\n\n");
}

export function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let currentList: string[] = [];
  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (trimmed.startsWith("## ")) {
      if (currentList.length > 0) {
        blocks.push({ id: uniqueId(), type: "list", value: currentList });
        currentList = [];
      }
      blocks.push({
        id: uniqueId(),
        type: "heading",
        value: trimmed.replace(/^##\s+/, ""),
      });
    } else if (trimmed.startsWith("- ")) {
      currentList.push(trimmed.replace(/^- /, ""));
    } else {
      if (currentList.length > 0) {
        blocks.push({ id: uniqueId(), type: "list", value: currentList });
        currentList = [];
      }
      blocks.push({ id: uniqueId(), type: "paragraph", value: trimmed });
    }
  }
  if (currentList.length > 0) {
    blocks.push({ id: uniqueId(), type: "list", value: currentList });
  }

  return blocks;
}
