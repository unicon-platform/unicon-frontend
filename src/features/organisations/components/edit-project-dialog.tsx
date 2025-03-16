import { zodResolver } from "@hookform/resolvers/zod";
import { PropsWithChildren, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { ProjectPublic } from "@/api";
import ErrorAlert from "@/components/form/fields/error-alert";
import TextField from "@/components/form/fields/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useUpdateProject } from "@/features/organisations/queries";

const projectFormSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
});

type ProjectFormType = z.infer<typeof projectFormSchema>;

type OwnProps = {
  project: ProjectPublic;
  handleOpenChange: (open: boolean) => void;
} & PropsWithChildren;

const EditProjectDialog: React.FC<OwnProps> = ({ project, handleOpenChange }) => {
  const form = useForm<ProjectFormType>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project,
  });

  const [error, setError] = useState("");

  const updateProjectMutation = useUpdateProject(project.id, project.organisation.id);

  const onSubmit: SubmitHandler<ProjectFormType> = (data) => {
    updateProjectMutation.mutate(data, {
      onError: () => {
        setError("Something went wrong.");
      },
      onSuccess: () => {
        form.reset();
      },
      onSettled: () => {
        handleOpenChange(false);
      },
    });
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit project</DialogTitle>
              <DialogDescription />
              {error && <ErrorAlert message={error} />}
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <TextField name="name" label="Name" />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
