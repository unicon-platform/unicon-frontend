import { DefinedInitialDataOptions } from "@tanstack/react-query";
import { UIMatch, useMatches } from "react-router-dom";

import { BreadcrumbDisplay, DynamicBreadcrumbPart, StaticBreadcrumbParts } from "@/components/layout/breadcrumb-part";
import { Breadcrumb as ShadcnBreadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { uuid } from "@/lib/utils";

type Handle<T> = {
  crumb?: (match: UIMatch) => BreadcrumbDisplay[];
  getData?: (match: UIMatch) => {
    queryOptions: DefinedInitialDataOptions<T>;
    extractData: (data: T) => BreadcrumbDisplay[];
  };
};

const Breadcrumb = () => {
  const matches = useMatches() as unknown as UIMatch<unknown, Handle<unknown>>[];
  const matchesWithBreadcrumbs = matches.filter((match) => !!match.handle?.crumb || !!match.handle?.getData);

  return (
    <>
      {matchesWithBreadcrumbs.length > 0 && <Separator orientation="vertical" className="mr-2 h-4" />}
      <ShadcnBreadcrumb>
        <BreadcrumbList>
          {matchesWithBreadcrumbs.map((match, index) =>
            match.handle.getData ? (
              <DynamicBreadcrumbPart
                key={uuid()}
                {...match.handle.getData(match)}
                isFirst={index === 0}
                isLast={index === matchesWithBreadcrumbs.length - 1}
              />
            ) : (
              <StaticBreadcrumbParts
                key={uuid()}
                parts={match.handle.crumb!(match)}
                isFirst={index === 0}
                isLast={index === matchesWithBreadcrumbs.length - 1}
              />
            ),
          )}
        </BreadcrumbList>
      </ShadcnBreadcrumb>
    </>
  );
};

export default Breadcrumb;
