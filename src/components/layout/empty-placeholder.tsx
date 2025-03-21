import { PropsWithChildren } from "react";

type OwnProps = {
  description: string;
} & PropsWithChildren;

const EmptyPlaceholder: React.FC<OwnProps> = ({ description, children }) => {
  return (
    <div className="rounded-md bg-zinc-800 p-4 text-center shadow-inner">
      {description} {children}
    </div>
  );
};

export default EmptyPlaceholder;
