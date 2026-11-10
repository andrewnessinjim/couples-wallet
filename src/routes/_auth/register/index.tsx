import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError, FieldGroup } from "@/components/ui/field";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  Link,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "../../../components/FormInput";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_auth/register/")({
  component: RegisterPage,
});

const registerSchema = z
  .object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "At least 8 characters"),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match",
    path: ["repeatPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

function RegisterPage() {
  const navigate = useNavigate();
  const { partnerEmail } = useLoaderData({ from: "/_auth" });
  const { code } = Route.useSearch();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: partnerEmail ?? "",
      password: "",
      repeatPassword: "",
    },
  });

  async function onSubmit({ email, password }: RegisterValues) {
    const emailRedirectTo = code
      ? `${window.location.origin}/invitation?code=${code}`
      : `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });

    if (error) {
      form.setError("root", { message: error.message });
      return;
    }

    navigate({ to: "/email-confirmation" });
  }

  const formRootError = form.formState.errors.root;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Your shared wallet starts here. 💕</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <CardContent>
          <FieldGroup>
            <FormInput
              name="email"
              type="email"
              label="Email"
              readOnly={!!partnerEmail}
              autoComplete="email"
              control={form.control}
            />
            <FormInput
              name="password"
              type="password"
              label="Password"
              autoComplete="new-password"
              control={form.control}
            />
            <FormInput
              name="repeatPassword"
              type="password"
              label="Repeat Password"
              autoComplete="new-password"
              control={form.control}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 flex-col items-start gap-4">
          {formRootError && <FieldError errors={[formRootError]} />}
          <Button
            className="w-full"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            Create Account
          </Button>
          <p className="text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 text-link"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
