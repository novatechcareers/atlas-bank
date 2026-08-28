type FormattedTextProps = {
  text: string;
  className?: string;
};

function renderLine(line: string, lineIndex: number) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);

  return (
    <span key={`line-${lineIndex}`} className="formatted-text-line">
      {parts.map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return <strong key={`part-${partIndex}`}>{part.slice(2, -2)}</strong>;
        }

        return <span key={`part-${partIndex}`}>{part}</span>;
      })}
    </span>
  );
}

export default function FormattedText({ text, className }: FormattedTextProps) {
  return (
    <div className={className}>
      {text.split("\n").map(renderLine)}
    </div>
  );
}