import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { FormInput } from "../-components/FormInput";

export const Route = createFileRoute("/_auth/login/")({
  component: LoginPage,
});

// 1. What valid form data looks like
const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginPage() {
  // 2. The form, validated by the zod schema
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // 3. Only runs when validation passes
  function onSubmit(values: LoginValues) {
    // TODO: call the auth provider once we pick a backend
    console.log(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>
          Welcome back. Log in to your shared wallet.
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <CardContent>
          <FieldGroup>
            <FormInput
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              control={form.control}
            />
            <FormInput
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              control={form.control}
            />
          </FieldGroup>
        </CardContent>

        <CardFooter className="mt-6 flex-col items-start gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            Log in
          </Button>
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="underline underline-offset-4">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
