import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, FileQuestion, Group, User2 } from "lucide-react";
import { AiFillSecurityScan } from "react-icons/ai";
import { GoPeople, GoProject, GoProjectSymlink } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";

import { logout, OrganisationPublicWithProjects, ProjectPublicWithProblems } from "@/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getOrganisationById, getOrganisations } from "@/features/organisations/queries";
import { getProjects } from "@/features/projects/queries";
import { useUserStore } from "@/store/user/user-store-provider";

const SIDEBAR_ITEMS = [
  { path: "/organisations", icon: <GoPeople />, label: "Organisations" },
  { path: "/projects", icon: <GoProject />, label: "Projects" },
];

type SidebarItem<Permission> = {
  path: string;
  icon: JSX.Element;
  label: string;
  permission?: Permission;
};

const ORGANISATION_SIDEBAR_ITEMS: SidebarItem<keyof Omit<OrganisationPublicWithProjects, "projects">>[] = [
  {
    path: "",
    icon: <GoProject />,
    label: "Projects",
  },
  {
    path: "/users",
    icon: <GoPeople />,
    label: "Users",
    permission: "edit_roles",
  },
];

const PROJECT_SIDEBAR_ITEMS: SidebarItem<keyof Omit<ProjectPublicWithProblems, "problems">>[] = [
  {
    path: "",
    icon: <FileQuestion />,
    label: "Problems",
  },
  // TODO: Disable submissions for user testing (09/04/25)
  // {
  //   path: "/submissions",
  //   icon: <ListChecks />,
  //   label: "Submissions",
  // },
  {
    path: "/users",
    icon: <GoPeople />,
    label: "Users",
    permission: "view_own_submission",
  },
  {
    path: "/roles",
    icon: <AiFillSecurityScan />,
    label: "Roles",
    permission: "view_roles",
  },
  {
    path: "/groups",
    icon: <Group />,
    label: "Groups",
    permission: "view_groups",
  },
];

type OwnProps = {
  pathname: string;
};

const AppSidebar: React.FC<OwnProps> = ({ pathname }) => {
  const { user, setUser } = useUserStore((store) => store);
  const navigate = useNavigate();

  const { data: projects } = useQuery(getProjects());
  const { data: organisations } = useQuery(getOrganisations());

  const isProjectPath = pathname.match(/\/projects\/\d+.*/)?.length ?? 0 > 0;
  const currentProjectId = isProjectPath ? Number(pathname.split("/")[2]) : -1;
  const currentProject = projects?.find((project) => project.id == currentProjectId);

  const isOrganisationPath = (pathname.match(/\/organisations\/\d+.*/)?.length ?? 0) > 0;
  const currentOrganisationId = isOrganisationPath ? Number(pathname.split("/")[2]) : -1;
  const { data: currentOrganisation } = useQuery({
    ...getOrganisationById(currentOrganisationId),
    enabled: isOrganisationPath,
  });

  if (!user) {
    return;
  }

  const signout = async () => {
    await logout({ withCredentials: true });
    setUser();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-0 bg-[#2e2931]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Unicon</SidebarGroupLabel>
          <SidebarMenu>
            {SIDEBAR_ITEMS.map(({ icon, label, path }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === path}
                  className="hover:bg-white/5 hover:data-[active=true]:bg-white/5"
                >
                  <Link to={path}>
                    {icon}
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {currentProject && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem key={"projects"}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      {<GoProjectSymlink />}
                      {currentProject.organisation.name} / {currentProject.name}
                      <ChevronDown className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                    {projects?.map((project) => (
                      <DropdownMenuItem asChild key={project.id}>
                        <Link to={`/projects/${project.id}`}>
                          {project.organisation.name} / {project.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
              <div className="mx-3.5 border-l px-2.5 group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:px-0">
                {PROJECT_SIDEBAR_ITEMS.map(({ icon, label, path, permission }) => {
                  const fullPath = `/projects/${currentProjectId}${path}`;
                  if (permission && !currentProject[permission]) {
                    return;
                  }
                  return (
                    <SidebarMenuItem key={path}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === fullPath}
                        className="hover:bg-white/5 hover:data-[active=true]:bg-white/5"
                      >
                        <Link to={fullPath}>
                          {icon}
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </div>
            </SidebarMenu>
          </SidebarGroup>
        )}
        {currentOrganisation && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem key={"organisations"}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      {<GoProjectSymlink />}
                      {currentOrganisation.name}
                      <ChevronDown className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                    {organisations?.map((organisation) => (
                      <DropdownMenuItem asChild key={organisation.id}>
                        <Link to={`/organisations/${organisation.id}`}>{organisation.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
              <div className="mx-3.5 border-l px-2.5 group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:px-0">
                {ORGANISATION_SIDEBAR_ITEMS.map(({ icon, label, path, permission }) => {
                  const fullPath = `/organisations/${currentOrganisationId}${path}`;
                  if (permission && !currentOrganisation[permission]) {
                    return;
                  }
                  return (
                    <SidebarMenuItem key={path}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === fullPath}
                        className="hover:bg-white/5 hover:data-[active=true]:bg-white/5"
                      >
                        <Link to={fullPath}>
                          {icon}
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </div>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user.username}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={signout} className="cursor-pointer">
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
