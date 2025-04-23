import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronDown, ChevronUp, Folder, FolderOpen, Plus, UsersIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import type { ProjectPublic } from "@/api";
import EmptyPlaceholder from "@/components/layout/empty-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JoinProjectDialog } from "@/features/projects/components/join-project-dialog";
import { getProjects } from "@/features/projects/queries";

const Projects = () => {
  const { data: projects, isLoading } = useSuspenseQuery(getProjects());
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState<Record<number, boolean>>({});

  // Group projects by organization ID
  const projectsByOrg = (projects ?? []).reduce<Record<number, ProjectPublic[]>>((acc, project) => {
    const orgId = project.organisation.id;
    return { ...acc, [orgId]: [...(acc[orgId] || []), project] };
  }, {});

  const toggleOrg = (orgId: number) => {
    setExpandedOrgs((prev) => ({
      ...prev,
      [orgId]: !prev[orgId],
    }));
  };

  return (
    <div className="m-auto flex w-full flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => {
            setJoinDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Join project
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {joinDialogOpen && <JoinProjectDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />}

        {!isLoading && Object.keys(projectsByOrg).length > 0 ? (
          Object.entries(projectsByOrg).map(([orgIdStr, orgProjects]) => {
            const orgId = Number(orgIdStr);
            const orgName = orgProjects[0]?.organisation.name || "Unknown Organization";
            const isExpanded = expandedOrgs[orgId] !== false; // Default to expanded

            return (
              <div
                key={orgId}
                className="overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className="flex cursor-pointer items-center justify-between bg-card p-4 hover:bg-accent/10"
                  onClick={() => toggleOrg(orgId)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md text-primary-foreground`}>
                      <UsersIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium">
                        {orgName} (<span className="font-mono">#{orgId}</span>)
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Folder className="h-3.5 w-3.5" />
                        <span>
                          {orgProjects.length} project{orgProjects.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="divide-y divide-border">
                    {orgProjects.map((project) => (
                      <Link to={`/projects/${project.id}`} key={project.id} className="block">
                        <div className="group flex items-center justify-between p-4 pl-[4.5rem] transition-colors hover:bg-accent/5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                              <FolderOpen className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="font-medium group-hover:text-primary">
                                {project.name} (<span className="font-mono">#{project.id}</span>)
                              </h3>
                              <div className="mt-1 flex items-center gap-2">
                                {project.roles[0] && (
                                  <Badge variant="secondary" className="flex items-center gap-1 px-2 py-0.5 text-xs">
                                    {project.roles[0].name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <EmptyPlaceholder description="No projects found.">
            <span className="cursor-pointer text-primary hover:opacity-80" onClick={() => setJoinDialogOpen(true)}>
              Join a project with an invitation key.
            </span>
          </EmptyPlaceholder>
        )}
      </div>
    </div>
  );
};

export default Projects;
