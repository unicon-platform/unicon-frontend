import "katex/dist/katex.min.css";

import { renderKatex } from "@/utils/katex";

type ProblemDescriptionProps = {
  description: string;
};

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ description }) => {
  return (
    description.length > 0 && (
      <div className="flex flex-col gap-2">
        <div className="text-lg font-medium">Description</div>
        <div
          className="prose whitespace-pre-line text-muted-foreground dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: renderKatex(description) }}
        ></div>
      </div>
    )
  );
};
