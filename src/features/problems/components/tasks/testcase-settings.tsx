import { DialogClose } from "@radix-ui/react-dialog";
import { Settings } from "lucide-react";
import { useState } from "react";

import ConfirmationDialog from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InfoTooltip from "@/components/ui/info-tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type TestcaseSettingsType = {
  name?: string;
  isPrivate?: boolean;
  showNodeGraph?: boolean;
  score: number;
};

type OwnProps = {
  settings: TestcaseSettingsType;
  onDelete: () => void;
  onSettingsChange: (change: TestcaseSettingsType) => void;
};

const TestcaseSettings: React.FC<OwnProps> = ({ onDelete, settings, onSettingsChange }) => {
  const [name, setName] = useState(settings.name ?? "");
  const [isPrivate, setIsPrivate] = useState(!!settings.isPrivate);
  const [showNodeGraph, setShowNodeGraph] = useState(!!settings.showNodeGraph);
  const [score, setScore] = useState(settings.score);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          <Settings />
          Testcase Settings
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onCloseAutoFocus={() => {
          setName(settings.name ?? "");
          setIsPrivate(!!settings.isPrivate);
          setShowNodeGraph(!!settings.showNodeGraph);
          setScore(settings.score);
        }}
      >
        <DialogHeader>
          <DialogTitle>Testcase Settings</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <h3 className="text-sm font-[450] text-zinc-400">Main</h3>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              maxLength={30}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username">Private?</Label>
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={() => setIsPrivate((isPrivate) => !isPrivate)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="score">Score</Label>
            <Input type="number" id="score" value={score} onChange={(e) => setScore(parseInt(e.target.value))} />
          </div>
          {!isPrivate && (
            <div className="mt-2">
              <h3 className="text-sm font-[450] text-zinc-400">Visibility</h3>
              <div className="mt-2 flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <p>Node graph</p>
                    <InfoTooltip content="Show the node graph to users. You are advised to uncheck this if you have files that are private (e.g. solution files.)" />
                  </div>
                  <Switch
                    checked={showNodeGraph}
                    onCheckedChange={() => setShowNodeGraph((showNodeGraph) => !showNodeGraph)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex sm:justify-between">
          <DialogClose asChild>
            <ConfirmationDialog description="Are you sure you want to delete this testcase?" onConfirm={onDelete}>
              <Button variant="destructive">Delete testcase</Button>
            </ConfirmationDialog>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="submit"
              onClick={() =>
                onSettingsChange({
                  name,
                  isPrivate,
                  showNodeGraph,
                  score,
                })
              }
            >
              Save changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestcaseSettings;
