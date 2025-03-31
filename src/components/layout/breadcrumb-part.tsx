import { DefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { uuid } from "@/lib/utils";

export type BreadcrumbDisplay = {
  url?: string;
  title: string;
};

interface BreadcrumbPartProps<T> {
  isFirst: boolean;
  isLast: boolean;
  queryOptions: DefinedInitialDataOptions<T>;
  extractData: (data: T) => BreadcrumbDisplay[];
}

const DEFAULT_TITLE = "Unicon 🌈";

export function DynamicBreadcrumbPart<T>({ queryOptions, extractData, isFirst, isLast }: BreadcrumbPartProps<T>) {
  const { data, isLoading } = useQuery({ ...queryOptions, enabled: !!queryOptions });
  const parts = isLoading ? [] : extractData(data);
  if (isLoading) {
    return (
      <React.Fragment>
        {!isFirst && <BreadcrumbSeparator />}
        <Skeleton className="h-4 w-24" />
      </React.Fragment>
    );
  }
  return <StaticBreadcrumbParts parts={parts} isFirst={isFirst} isLast={isLast} />;
}

export function StaticBreadcrumbParts({
  parts,
  isFirst,
  isLast,
}: {
  parts: BreadcrumbDisplay[] | BreadcrumbDisplay;
  isFirst: boolean;
  isLast: boolean;
}) {
  if (!Array.isArray(parts)) {
    parts = [parts];
  }
  useEffect(() => {
    if (isLast) {
      document.title = parts[parts.length - 1]?.title ?? DEFAULT_TITLE;
    }
  }, [parts, isLast]);
  return (
    <React.Fragment>
      {!isFirst && <BreadcrumbSeparator />}
      {parts.map((part, index) => (
        <React.Fragment key={uuid()}>
          {index !== 0 && <BreadcrumbSeparator />}
          {isLast && index === parts.length - 1 ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{part.title}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <BreadcrumbItem>
              {part.url ? (
                <BreadcrumbLink asChild>
                  <Link to={part.url}>{part.title}</Link>
                </BreadcrumbLink>
              ) : (
                <span>{part.title}</span>
              )}
            </BreadcrumbItem>
          )}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}
