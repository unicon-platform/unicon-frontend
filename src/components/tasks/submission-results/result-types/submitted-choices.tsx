import React from "react";

import { cn } from "@/lib/utils";

type Choice = {
  text: string;
  wasChosen: boolean;
  isCorrect: boolean;
};

type OwnProps = {
  choices: Choice[];
};

const SubmittedChoices: React.FC<OwnProps> = ({ choices }) => {
  return (
    <div className="flex flex-col gap-1">
      {choices.map((choice, index) => (
        <div
          className={cn("flex gap-2 px-1", {
            "bg-success/50": choice.isCorrect && choice.wasChosen,

            "bg-destructive/50": !choice.isCorrect && choice.wasChosen,
          })}
          key={index}
        >
          <input type="radio" disabled checked={choice.wasChosen} />
          <span>{choice.text}</span>
        </div>
      ))}
    </div>
  );
};

export default SubmittedChoices;
