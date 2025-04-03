import { useQuery } from "@tanstack/react-query";
import { LockIcon } from "lucide-react";

import { File as UniconFile, InputStep, OutputSocket, OutputStep, Testcase as TestcaseApi } from "@/api";
import EmptyPlaceholder from "@/components/layout/empty-placeholder";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GraphAction } from "@/features/problems/components/tasks/graph-context";
import Testcase from "@/features/problems/components/tasks/testcase";
import { getProblemById } from "@/features/problems/queries";
import { useProblemId } from "@/features/projects/hooks/use-id";
import { cn } from "@/lib/utils";

const ExpectedOutputTable: React.FC<{ sockets: OutputSocket[] }> = ({ sockets }) => {
  return (
    <div className="w-full max-w-3xl py-2">
      <Table className="overflow-hidden">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3 font-medium">Label</TableHead>
            <TableHead className="font-medium">Expected</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sockets.map((socket) => (
            <TableRow key={socket.id}>
              <TableCell>{socket.label}</TableCell>
              <TableCell className="max-w-md truncate font-mono">
                {socket.comparison ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-zinc-800 font-mono text-zinc-300">
                          {socket.comparison.operator}
                        </Badge>
                        <span className="max-w-md truncate">{JSON.stringify(socket.comparison.value)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-h-60 max-w-lg overflow-auto text-sm">
                      <pre>{JSON.stringify(socket.comparison.value, null, 2)}</pre>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="italic text-zinc-500">No expected output, informational log/output only</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

type SettingsChange = {
  name?: string;
  isPrivate?: boolean;
  score: number;
};

type TestcaseTabsProps = {
  testcases: TestcaseApi[];
  edit: boolean;
  taskFiles: UniconFile[];
  sharedUserInput?: InputStep;
  onDelete?: (index: number) => () => void;
  onGraphChange?: (index: number) => (action: GraphAction) => void;
  onSettingsChange?: (index: number) => (change: SettingsChange) => void;
  onDuplicateTestcase?: (index: number) => () => void;
};

const TestcaseTabs: React.FC<TestcaseTabsProps> = ({
  testcases,
  edit,
  taskFiles,
  sharedUserInput,
  onDelete,
  onGraphChange,
  onSettingsChange,
  onDuplicateTestcase,
}) => {
  const problemId = useProblemId();
  const { data: problem } = useQuery(getProblemById(problemId));
  const showDetails = !!problem?.view_hidden_details;

  if (testcases.length === 0) {
    return (
      <div className="mt-4">
        <EmptyPlaceholder description="No testcases added." />
      </div>
    );
  }

  const testcaseOutputSteps: (OutputStep | undefined)[] = testcases.map(
    (testcase) => testcase.nodes.find((node) => node.type === "OUTPUT_STEP") as OutputStep,
  );

  return (
    <Tabs defaultValue={testcases[0]?.id}>
      <div className="flex justify-between">
        <TabsList>
          {testcases.map((testcase, index) => (
            <TabsTrigger key={testcase.id} value={testcase.id} className="text-sm">
              <div className="flex max-w-fit items-center gap-2 rounded-full text-sm shadow-sm">
                <span className={cn("font-mono", { "text-zinc-300": !testcase.name })}>#{index + 1}</span>
                {testcase.name && <span className="truncate text-white">{testcase.name}</span>}
                {testcase.is_private && <LockIcon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {testcases.map((testcase, index) => (
        <TabsContent key={testcase.id} value={testcase.id}>
          {showDetails || testcase.show_node_graph ? (
            <Testcase
              edit={edit}
              index={index}
              nodeGraphOnChange={onGraphChange && onGraphChange(index)}
              sharedUserInput={sharedUserInput}
              taskFiles={taskFiles}
              testcase={testcase}
              onDelete={onDelete}
              onSettingsChange={onSettingsChange && onSettingsChange(index)}
              onDuplicateTestcase={onDuplicateTestcase && onDuplicateTestcase(index)}
            />
          ) : (
            <ExpectedOutputTable
              sockets={testcaseOutputSteps[index]?.inputs.filter((socket) => socket.type === "DATA") || []}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TestcaseTabs;
