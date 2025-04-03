import React from "react";
import { Link } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProblemTabsProps = {
  projectId: number;
  problemId: number;
  leaderboardEnabled: boolean;
};

export const ProblemTabs: React.FC<ProblemTabsProps> = ({ leaderboardEnabled, projectId, problemId }) => {
  return (
    leaderboardEnabled && (
      <Tabs defaultValue="problem">
        <TabsList>
          <TabsTrigger value="problem">
            <Link to={`/projects/${projectId}/problems/${problemId}`}>Problem</Link>
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Link to={`/projects/${projectId}/problems/${problemId}/leaderboard`}>Leaderboard</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    )
  );
};
