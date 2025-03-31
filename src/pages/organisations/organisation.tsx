import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Edit, EllipsisVertical, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ProjectPublic } from "@/api";
import ConfirmationDialog from "@/components/confirmation-dialog";
import EmptyPlaceholder from "@/components/layout/empty-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditOrganisationDialog from "@/features/organisations/components/edit-organisation-dialog";
import EditProjectDialog from "@/features/organisations/components/edit-project-dialog";
import { getOrganisationById, useDeleteOrganisation, useDeleteProject } from "@/features/organisations/queries";
import { useOrganisationId } from "@/features/projects/hooks/use-id";

const Organisation = () => {
  const id = useOrganisationId();
  const { data: organisation } = useSuspenseQuery(getOrganisationById(id));
  const deleteOrganisationMutation = useDeleteOrganisation(id);
  const deleteProjectMutation = useDeleteProject(id);
  const navigate = useNavigate();

  // for edit project dialog/confirmation dialog for delete since the dropdown menu
  // is preventing is making the dialogs disappear on clicking the menu button
  const [editProject, setEditProject] = useState<ProjectPublic | null>(null);
  const [deleteProject, setDeleteProject] = useState<ProjectPublic | null>(null);

  if (!organisation) {
    return <div>Something went wrong.</div>;
  }

  return (
    <div className="m-auto flex w-full flex-col gap-8">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h2 className="text-3xl font-semibold">{organisation.name}</h2>
          <p className="text-gray-500">{organisation.description}</p>
        </div>
        <div className="flex items-start gap-2">
          {organisation.edit && (
            <EditOrganisationDialog organisation={organisation}>
              <Button variant="ghost" className="hover:text-purple-300">
                <Edit /> Edit details
              </Button>
            </EditOrganisationDialog>
          )}
          {organisation.delete && (
            <ConfirmationDialog
              onConfirm={() => {
                deleteOrganisationMutation.mutate(undefined, {
                  onSuccess: () => {
                    navigate(`/organisations`);
                  },
                });
              }}
              description="This will delete the organisation and all its projects. This action cannot be undone."
            >
              <Button variant="destructive">
                <Trash />
              </Button>
            </ConfirmationDialog>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <Link to={`/organisations/${id}/projects/new`} className="flex gap-1">
          {organisation.edit && (
            <Button variant="ghost" className="hover:text-purple-300">
              <Plus /> New Project
            </Button>
          )}
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {organisation.projects.length === 0 && <EmptyPlaceholder description="No projects found." />}
        {organisation.projects.map((project) => (
          <Card className="group flex justify-between p-4 hover:opacity-80" key={project.id}>
            <CardTitle>{project.name}</CardTitle>
            <div className="relative flex gap-4">
              {organisation.edit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <EllipsisVertical className="h-4 w-4 cursor-pointer" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditProject(project)}>
                      <div>Edit</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteProject(project)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Link to={`/projects/${project.id}`} key={project.id}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        ))}
        {deleteProject && (
          <ConfirmationDialog
            description="This will permanently delete the project, including all problems and submissions."
            setOpen={() => setDeleteProject(null)}
            onConfirm={() => deleteProjectMutation.mutate(deleteProject.id)}
          />
        )}
        {editProject && <EditProjectDialog project={editProject} handleOpenChange={() => setEditProject(null)} />}
      </div>
    </div>
  );
};

export default Organisation;
