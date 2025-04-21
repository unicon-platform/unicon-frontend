// @ts-expect-error package doesn't have type definitions
import JSONGrid from "@redheadphone/react-json-grid";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * Source: https://stackoverflow.com/a/20392392
 * This function will return `false` for any valid json primitive
 */
const tryParseJSONObject = (jsonString: string) => {
  try {
    const o = JSON.parse(jsonString);
    if (o && (o instanceof Array || o instanceof Object)) {
      return o;
    }
  } catch (e) {} // eslint-disable-line

  return false;
};

type OutputRendererProps = {
  output: string;
};

export const OutputRenderer: React.FC<OutputRendererProps> = ({ output }) => {
  output = output.replace(/\\n/g, "\n");
  const outputObject = tryParseJSONObject(output);

  if (outputObject) {
    return (
      <Collapsible>
        <JSONGrid data={outputObject} />
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            Original Output
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2">
          <div className="w-full rounded-md border p-2 font-mono text-sm shadow-sm">
            <p className="whitespace-pre-wrap font-mono">{output}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
  return <p className="whitespace-pre-wrap font-mono">{output}</p>;
};
