import React, { useEffect } from "react";
import { Link, UIMatch, useLocation, useMatches } from "react-router-dom";

import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { uuid } from "@/lib/utils";

type Handle = {
  crumb?: (match: UIMatch) => BreadcrumbPart;
};

export type BreadcrumbPart = {
  href?: string;
  label: string;
};

const DEFAULT_TITLE = "Unicon 🌈";

const Breadcrumb = () => {
  const matches = useMatches() as unknown as UIMatch<unknown, Handle>[];
  const matchesWithBreadcrumbs = matches.filter((match) => !!match.handle?.crumb);
  const parts = matchesWithBreadcrumbs
    .flatMap((match: UIMatch<unknown, Handle>) => match.handle.crumb?.(match))
    .filter((part) => !!part);
  const pathname = useLocation().pathname;

  useEffect(() => {
    document.title = parts[parts.length - 1]?.label ?? DEFAULT_TITLE;
  }, [parts]);

  return (
    <>
      {matchesWithBreadcrumbs.length > 0 && <Separator orientation="vertical" className="mr-2 h-4" />}
      <ShadcnBreadcrumb>
        <BreadcrumbList>
          {parts.map((part, index) => {
            return (
              <React.Fragment key={uuid()}>
                {index !== 0 && <BreadcrumbSeparator />}
                {index !== parts.length - 1 && (
                  <BreadcrumbItem>
                    {part.href && part.href !== pathname ? (
                      <BreadcrumbLink asChild>
                        <Link to={part.href}>{part.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <span>{part.label}</span>
                    )}
                  </BreadcrumbItem>
                )}
                {index === parts.length - 1 && (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{part.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </ShadcnBreadcrumb>
    </>
  );
};

export default Breadcrumb;
