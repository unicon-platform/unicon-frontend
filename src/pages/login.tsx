import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError, HttpStatusCode } from "axios";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { login } from "@/api";
import ErrorAlert from "@/components/form/fields/error-alert";
import PasswordField from "@/components/form/fields/password-field";
import TextField from "@/components/form/fields/text-field";
import { ModeToggle } from "@/components/mode-toggle";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useUserStore } from "@/store/user/user-store-provider";

const loginFormSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

const loginFormDefault = {
  username: "",
  password: "",
};

type LoginForm = z.infer<typeof loginFormSchema>;

const UNAUTHORIZED_ERROR = "Invalid username or password.";
const UNEXPECTED_ERROR = "An unexpected error occurred. Please try again later.";

const Login = () => {
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: loginFormDefault,
  });

  const [error, setError] = useState("");
  const { user, setUser, isLoading } = useUserStore((store) => store);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (isLoading || user) {
    return;
  }

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    try {
      const response = await login({
        body: data,
        headers: undefined,
        withCredentials: true,
      });
      setError("");
      setUser(response.data?.user);
      navigate("/");
    } catch (error) {
      switch ((error as AxiosError).response?.status) {
        case HttpStatusCode.Unauthorized:
          setError(UNAUTHORIZED_ERROR);
          break;
        default:
          setError(UNEXPECTED_ERROR);
          break;
      }
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="fixed left-5 top-5">
        <ModeToggle />
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <h1 className="text-5xl font-medium">Unicon 🦄</h1>
        <h2 className="mt-1 text-xl">
          <span className="">Uni</span>versal Programming <span className="">Con</span>
          test Platform
        </h2>
        <Card className="mt-8 w-full p-6 sm:max-w-lg">
          <CardContent>
            <Box className="space-y-6">
              {error && <ErrorAlert message={error} />}
              <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <TextField label="Username" name="username" />
                    <PasswordField label="Password" name="password" />
                  </div>
                  <Button className="w-full" type="submit">
                    Log in
                  </Button>
                </form>
              </Form>
            </Box>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/signup" className="hover:opacity-50">
              Don't have an account? Sign up.
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
