/** Lightweight markdown-ish blocks for trip descriptions. */
export function renderDescription(text: string): { type: "h2" | "p" | "li"; content: string }[] {
  const lines = text.split("\n");
  const blocks: { type: "h2" | "p" | "li"; content: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", content: trimmed.slice(3) });
    } else if (trimmed.startsWith("- ")) {
      blocks.push({ type: "li", content: trimmed.slice(2) });
    } else {
      blocks.push({ type: "p", content: trimmed });
    }
  }

  return blocks;
}
