import { AlertCircleIcon, CheckCircleIcon, CircleXIcon, InfoIcon, LayoutGridIcon } from "lucide-react";

import { OutputStep, Status, Testcase, TestcaseResult as TestcaseResultType } from "@/api";
import SocketResultTable from "@/components/tasks/submission-results/result-types/table/socket-result-table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TestcaseResultProps = {
  index: number;
  result: TestcaseResultType;
  testcase: Testcase;
  hideDetails?: boolean;
};

const STATUS_DESCRIPTIONS: Record<Status, string> = {
  OK: "Passed",
  TLE: "Time Limit Exceeded",
  MLE: "Memory Limit Exceeded",
  RTE: "Runtime Error",
  WA: "Wrong Answer",
};

const TestcaseResult: React.FC<TestcaseResultProps> = ({ result, index, testcase, hideDetails = false }) => {
  const outputStep = testcase.nodes.filter((node) => node.type == "OUTPUT_STEP")[0] as OutputStep;

  const combinedResults = result.results?.map((socketResult) => {
    const testcaseSocketMetadata = outputStep.inputs.filter((input) => input.id === socketResult.id);
    return {
      ...socketResult,
      value: socketResult.value,
      socketMetadata: testcaseSocketMetadata[0],
      testcase,
    };
  });

  return (
    <div>
      <div className={cn("flex gap-3")}>
        <span>Testcase {index + 1}</span>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors",
                { "border-emerald-400 bg-emerald-300 text-emerald-800 hover:bg-emerald-400": result.status === "OK" },
                { "border-red-400 bg-red-300 text-red-800 hover:bg-red-400": result.status !== "OK" },
              )}
            >
              {result.status === "OK" ? <CheckCircleIcon size={15} /> : <AlertCircleIcon size={15} />}
              {result.status}
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs" side="right">
            {STATUS_DESCRIPTIONS[result.status]}
          </TooltipContent>
        </Tooltip>
      </div>
      <Accordion type="multiple" className="mt-2" defaultValue={[`result-${index}`]}>
        <AccordionItem value={`result-${index}`}>
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <LayoutGridIcon size={15} />
              Output
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SocketResultTable data={combinedResults || []} />
          </AccordionContent>
        </AccordionItem>
        {!hideDetails && result.stdout.length > 0 && (
          <AccordionItem value={`stdout-${index}`}>
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <InfoIcon size={15} />
                Log Messages
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <pre className="text-wrap">{result.stdout}</pre>
            </AccordionContent>
          </AccordionItem>
        )}
        {!hideDetails && result.stderr.length > 0 && (
          <AccordionItem value={`stderr-${index}`}>
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <CircleXIcon size={15} />
                Error Messages
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <pre className="text-wrap">{result.stderr}</pre>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default TestcaseResult;
