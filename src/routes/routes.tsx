import "@/index.css";

import { Navigate, UIMatch } from "react-router-dom";

import { GroupPublic, OrganisationPublic, Problem as ProblemType, ProblemPublic, ProjectPublic } from "@/api";
import AuthenticatedPage from "@/components/layout/authenticated-page";
import Layout from "@/components/layout/layout.tsx";
import { getOrganisationById } from "@/features/organisations/queries";
import { getProblemById } from "@/features/problems/queries";
import { getProjectById, getProjectGroupById } from "@/features/projects/queries";
import Error from "@/pages/error";
import Login from "@/pages/login";
import CreateOrganisation from "@/pages/organisations/create-organisation";
import Organisation from "@/pages/organisations/organisation";
import OrganisationUsers from "@/pages/organisations/organisation-users";
import Organisations from "@/pages/organisations/organisations";
import EditProblem from "@/pages/problems/edit-problem";
import Problem from "@/pages/problems/problem";
import ProblemLeaderboard from "@/pages/problems/problem-leaderboard";
import CreateProject from "@/pages/projects/create-project";
import EditProjectGroup from "@/pages/projects/edit-project-group";
import Project from "@/pages/projects/project";
import ProjectGroups from "@/pages/projects/project-groups";
import ProjectRoles from "@/pages/projects/project-roles";
import ProjectUsers from "@/pages/projects/project-users";
import Projects from "@/pages/projects/projects";
import SignUp from "@/pages/signup";
import SubmissionResults from "@/pages/submission-results";
import Submissions from "@/pages/submissions";
import CreateMultipleChoice from "@/pages/tasks/create-multiple-choice";
import CreateMultipleResponse from "@/pages/tasks/create-multiple-response";
import CreateProgramming from "@/pages/tasks/create-programming";
import CreateShortAnswer from "@/pages/tasks/create-short-answer";
import EditTask from "@/pages/tasks/edit-task";

export const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        element: <AuthenticatedPage />,
        children: [
          {
            index: true,
            element: <Navigate to="/projects" />,
          },
          {
            path: "organisations",
            handle: {
              crumb: () => ({ title: "Organisations", url: "/organisations" }),
            },
            children: [
              { index: true, element: <Organisations /> },
              {
                path: "new",
                element: <CreateOrganisation />,
                handle: {
                  crumb: () => ({
                    title: "New organisation",
                    url: "/organisations/new",
                  }),
                },
              },
              {
                path: ":organisationId",
                children: [
                  {
                    index: true,
                    element: <Organisation />,
                    handle: {
                      crumb: () => ({
                        title: "Projects",
                      }),
                    },
                  },
                  {
                    path: "projects/new",
                    element: <CreateProject />,
                    handle: {
                      crumb: () => ({
                        title: "New project",
                      }),
                    },
                  },
                  {
                    path: "users",
                    element: <OrganisationUsers />,
                    handle: {
                      crumb: () => ({
                        title: "Users",
                      }),
                    },
                  },
                ],
                handle: {
                  getData: (match: UIMatch) => ({
                    queryOptions: getOrganisationById(Number(match.params.organisationId)),
                    extractData: (data: OrganisationPublic) => {
                      return [
                        {
                          title: data.name,
                          url: "/organisations/" + data.id,
                        },
                      ];
                    },
                  }),
                },
              },
            ],
          },
          {
            path: "projects",
            handle: {
              crumb: () => ({ title: "Projects", url: "/projects" }),
            },
            children: [
              { index: true, element: <Projects /> },
              {
                path: ":projectId",
                handle: {
                  getData: (match: UIMatch) => ({
                    queryOptions: getProjectById(Number(match.params.projectId)),
                    extractData: (data: ProjectPublic) => {
                      return [
                        {
                          title: data.organisation.name,
                          url: "/organisations/" + data.organisation.id,
                        },
                        {
                          title: data.name,
                          url: "/projects/" + data.id,
                        },
                      ];
                    },
                  }),
                },
                children: [
                  {
                    index: true,
                    element: <Project />,
                    handle: {
                      crumb: () => ({ title: "Problems" }),
                    },
                  },
                  {
                    path: "roles",
                    element: <ProjectRoles />,
                    handle: {
                      crumb: () => ({ title: "Roles" }),
                    },
                  },
                  {
                    path: "users",
                    element: <ProjectUsers />,
                    handle: {
                      crumb: () => ({ title: "Users" }),
                    },
                  },
                  {
                    path: "groups",
                    handle: {
                      crumb: (match: UIMatch) => ({
                        title: "Groups",
                        url: `/projects/${match.params.projectId}/groups`,
                      }),
                    },
                    children: [
                      { index: true, element: <ProjectGroups /> },
                      {
                        path: ":groupId",
                        element: <EditProjectGroup />,
                        handle: {
                          getData: (match: UIMatch) => ({
                            queryOptions: getProjectGroupById(
                              Number(match.params.projectId),
                              Number(match.params.groupId),
                            ),
                            extractData: (data: GroupPublic) => {
                              return [
                                {
                                  title: data.name,
                                  url: "/projects/" + match.params.projectId + "/groups/" + match.params.groupId,
                                },
                              ];
                            },
                          }),
                        },
                      },
                    ],
                  },
                  {
                    path: "submissions",
                    handle: {
                      crumb: (match: UIMatch) => ({
                        title: "Submissions",
                        url: `/projects/${match.params.projectId}/submissions`,
                      }),
                    },
                    children: [
                      {
                        index: true,
                        element: <Submissions />,
                      },
                      {
                        path: ":submissionId",
                        element: <SubmissionResults />,
                        handle: {
                          crumb: (match: UIMatch) => ({
                            title: match.params.submissionId,
                          }),
                        },
                      },
                    ],
                  },
                  {
                    path: "problems",
                    handle: {
                      getData: (match: UIMatch) => ({
                        queryOptions: getProblemById(Number(match.params.problemId)),
                        extractData: (data: ProblemPublic) => {
                          return [
                            { title: "Problems", url: `/projects/${match.params.projectId}` },
                            {
                              title: data.name,
                              url: "/projects/" + match.params.projectId + "/problems/" + data.id,
                            },
                          ];
                        },
                      }),
                    },
                    children: [
                      {
                        path: ":problemId",
                        children: [
                          { index: true, element: <Problem /> },
                          {
                            path: "leaderboard",
                            element: <ProblemLeaderboard />,
                          },
                          {
                            path: "edit",
                            handle: {
                              crumb: (match: UIMatch) => ({
                                title: "Edit",
                                url: `/projects/${match.params.projectId}/problems/${match.params.problemId}/edit`,
                              }),
                            },
                            children: [
                              {
                                index: true,
                                element: <EditProblem />,
                              },
                              {
                                path: "tasks/:taskId",
                                element: <EditTask />,
                                handle: {
                                  getData: (match: UIMatch) => ({
                                    queryOptions: getProblemById(Number(match.params.problemId)),
                                    extractData: (data: ProblemType) => {
                                      const task = data.tasks.find((task) => task.id === Number(match.params.taskId));
                                      return [
                                        {
                                          title: `Task ${(task?.order_index ?? 0) + 1}`,
                                          url: `/projects/${match.params.projectId}/problems/${match.params.problemId}/edit`,
                                        },
                                      ];
                                    },
                                  }),
                                },
                              },
                              {
                                path: "tasks/new",
                                children: [
                                  {
                                    path: "multiple-choice",
                                    element: <CreateMultipleChoice />,
                                    handle: {
                                      crumb: () => ({
                                        title: "New Multiple Choice Task",
                                      }),
                                    },
                                  },
                                  {
                                    path: "multiple-response",
                                    element: <CreateMultipleResponse />,
                                    handle: {
                                      crumb: () => ({
                                        title: "New Multiple Response Task",
                                      }),
                                    },
                                  },
                                  {
                                    path: "short-answer",
                                    element: <CreateShortAnswer />,
                                    handle: {
                                      crumb: () => ({
                                        title: "New Short Answer Task",
                                      }),
                                    },
                                  },
                                  {
                                    path: "programming",
                                    element: <CreateProgramming />,
                                    handle: {
                                      crumb: () => ({
                                        title: "New Programming Task",
                                      }),
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
    ],
  },
];
