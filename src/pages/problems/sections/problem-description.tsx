import { MarkdownRenderer } from "@/components/markdown/renderer";

type ProblemDescriptionProps = {
  description: string;
};

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ description }) => {
  return (
    description.length > 0 && (
      <div className="flex flex-col gap-2">
        <div className="text-lg font-medium">Description</div>
        <div className="prose max-w-none dark:prose-invert">
          <MarkdownRenderer markdown={description} />
        </div>
      </div>
    )
  );
};
