import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";

type MarkdownRendererProps = {
  markdown: string;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  return (
    <Markdown remarkPlugins={[remarkGfm, remarkMath, remarkRehype, rehypeKatex, rehypeHighlight]}>{markdown}</Markdown>
  );
};
