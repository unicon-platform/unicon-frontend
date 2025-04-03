type ProblemDescriptionProps = {
  description: string;
};

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ description }) => {
  return (
    description.length > 0 && (
      <div className="flex flex-col gap-2">
        <div className="text-lg font-medium">Description</div>
        <p className="whitespace-pre-line text-muted-foreground">{description}</p>
      </div>
    )
  );
};
