const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

export function ChatMessageContent({
  text,
  linkClassName,
}: {
  text: string;
  linkClassName?: string;
}) {
  const parts: { type: "text" | "url"; value: string }[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const url = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    parts.push({ type: "url", value: url });
    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  if (parts.length === 0) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, i) =>
        part.type === "url" ? (
          <a
            key={`${part.value}-${i}`}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {part.value}
          </a>
        ) : (
          <span key={`text-${i}`}>{part.value}</span>
        ),
      )}
    </>
  );
}
