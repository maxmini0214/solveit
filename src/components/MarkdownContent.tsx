"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  content: string;
  className?: string;
  /** If true, renders compact version for list previews */
  compact?: boolean;
}

export default function MarkdownContent({
  content,
  className = "",
  compact = false,
}: MarkdownContentProps) {
  return (
    <div
      className={`markdown-content ${compact ? "compact" : ""} ${className}`}
    >
      <ReactMarkdown
        components={{
          // Disable images (no image upload yet)
          img: () => null,
          // Open links in new tab, add nofollow
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              {...props}
            >
              {children}
            </a>
          ),
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1 ml-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1 ml-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          // Inline code
          code: ({ children, className }) => {
            // Check if it's a code block (has language class)
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block bg-neutral-800/80 rounded-lg p-3 my-2 text-sm font-mono overflow-x-auto">
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-neutral-800/80 rounded px-1.5 py-0.5 text-sm font-mono text-emerald-300">
                {children}
              </code>
            );
          },
          // Code blocks
          pre: ({ children }) => (
            <pre className="bg-neutral-800/80 rounded-lg p-3 my-2 text-sm overflow-x-auto">
              {children}
            </pre>
          ),
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-emerald-500/50 pl-3 my-2 text-neutral-400 italic">
              {children}
            </blockquote>
          ),
          // Horizontal rule
          hr: () => <hr className="border-neutral-700 my-4" />,
          // Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
