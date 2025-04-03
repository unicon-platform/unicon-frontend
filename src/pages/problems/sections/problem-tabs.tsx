import React from "react";
import { Link } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProblemTabsProps = {
  projectId: number;
  problemId: number;
  leaderboardEnabled: boolean;
  defaultValue?: "problem" | "leaderboard";
};

export const ProblemTabs: React.FC<ProblemTabsProps> = ({ leaderboardEnabled, projectId, problemId, defaultValue }) => {
  return (
    leaderboardEnabled && (
      <Tabs defaultValue={defaultValue ?? "problem"}>
        <TabsList>
          <Link to={`/projects/${projectId}/problems/${problemId}`}>
            <TabsTrigger value="problem">Problem</TabsTrigger>
          </Link>
          <Link to={`/projects/${projectId}/problems/${problemId}/leaderboard`}>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
    )
  );
};
