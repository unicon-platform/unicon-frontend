import { PropsWithChildren } from "react";

type FormSectionProps = {
  title: string;
  description?: React.ReactNode;
} & PropsWithChildren;

const FormSection: React.FC<FormSectionProps> = ({ title, description, children }) => {
  return (
    <div className="flex w-full items-start">
      <div className="flex flex-col gap-2">
        <h2 className="w-[250px] text-lg font-medium">{title}</h2>
        {description && <div className={"w-[180px] text-sm text-muted-foreground"}>{description}</div>}
      </div>
      <div className="flex w-full min-w-0 flex-col gap-4">{children}</div>
    </div>
  );
};

export default FormSection;
