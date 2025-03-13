import { PropsWithChildren } from "react";

export const PageContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="mt-2 flex w-full px-8 py-4">{children}</div>;
};
