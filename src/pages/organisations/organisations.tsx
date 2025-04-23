import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import EmptyPlaceholder from "@/components/layout/empty-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { JoinOrganisationDialog } from "@/features/organisations/components/join-organisation-dialog";
import { getOrganisations } from "@/features/organisations/queries";

const Organisations = () => {
  const { data: organisations, isLoading } = useSuspenseQuery(getOrganisations());
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  return (
    <div className="m-auto flex w-full flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Organisations</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setJoinDialogOpen(true);
            }}
          >
            <Plus /> Join organisation
          </Button>
          <Link to="/organisations/new" className="flex gap-1">
            <Button variant="ghost">
              <Plus /> New organisation
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {joinDialogOpen && <JoinOrganisationDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />}
        {!isLoading &&
          organisations?.map((organisation) => (
            <Link to={`/organisations/${organisation.id}`} key={organisation.id}>
              <Card className="group flex justify-between p-4 hover:opacity-80">
                <CardTitle>{organisation.name}</CardTitle>
                <ArrowRight className="hidden h-4 w-4 group-hover:block" />
              </Card>
            </Link>
          ))}
        {!isLoading && organisations?.length === 0 && (
          <EmptyPlaceholder description="No organisations found.">
            <br />
            <span>
              If you're looking to submit solutions, check out{" "}
              <Link to="/projects" className="hover:opacity-50">
                Projects
              </Link>
              .
            </span>
          </EmptyPlaceholder>
        )}
      </div>
    </div>
  );
};

export default Organisations;
