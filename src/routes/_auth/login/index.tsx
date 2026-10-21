import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => {
                console.log({ field, fieldState });
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex gap-4 items-baseline">
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </div>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                  </Field>
                );
              }}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex gap-4 items-baseline">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </div>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>

        <CardFooter className="mt-6">
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            Log in
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
