import React from 'react';

interface HighlightTextProps {
  text: string;
  terms: string[];
  className?: string;
  highlightClassName?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  terms,
  className = '',
  highlightClassName = 'bg-amber-200 text-amber-950 dark:bg-amber-500/30 dark:text-amber-200 font-semibold px-0.5 rounded',
}) => {
  if (!terms || terms.length === 0 || !text) {
    return <span className={className}>{text}</span>;
  }

  // Filter out terms with length < 2 to avoid excessive single-character highlights
  const validTerms = Array.from(new Set(terms.filter(t => t && t.trim().length > 1)));
  if (validTerms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Escape regex special chars
  const escapedTerms = validTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const isMatch = validTerms.some(t => t.toLowerCase() === part.toLowerCase());
        return isMatch ? (
          <mark key={i} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
};
