import { Fragment } from "react";

type Props = {
  text: string;
  className?: string;
};

function renderInlineBold(text: string) {
  const parts = text.split("**");
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return <strong key={`b-${idx}`}>{part}</strong>;
    }
    return <Fragment key={`t-${idx}`}>{part}</Fragment>;
  });
}

type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseBlocks(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const inlineBulletParts = line
      .split(/(?=\s*•)/)
      .map(part => part.trim())
      .filter(Boolean);
    if (inlineBulletParts.length > 1 && inlineBulletParts.every(part => /^•/.test(part))) {
      blocks.push({
        type: "ul",
        items: inlineBulletParts.map(part => part.replace(/^•\s*/, "").trim()).filter(Boolean),
      });
      i += 1;
      continue;
    }

    if (/^\s*(?:[-•])\s*/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*(?:[-•])\s*/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*(?:[-•])\s*/, "").trim());
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, "").trim());
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*(?:[-•])\s*/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "p", text: paragraphLines.join(" ") });
  }

  return blocks;
}

export default function FormattedDescription({ text, className }: Props) {
  const blocks = parseBlocks(text ?? "");

  if (!blocks.length) {
    return <p className={className}>Brak opisu</p>;
  }

  return (
    <div className={className}>
      {blocks.map((block, idx) => {
        if (block.type === "ul") {
          return (
            <ul key={`ul-${idx}`} className="list-disc pl-6 space-y-1">
              {block.items.map((item, itemIdx) => (
                <li key={`uli-${itemIdx}`}>{renderInlineBold(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={`ol-${idx}`} className="list-decimal pl-6 space-y-1">
              {block.items.map((item, itemIdx) => (
                <li key={`oli-${itemIdx}`}>{renderInlineBold(item)}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`p-${idx}`} className="whitespace-pre-wrap">
            {renderInlineBold(block.text)}
          </p>
        );
      })}
    </div>
  );
}

