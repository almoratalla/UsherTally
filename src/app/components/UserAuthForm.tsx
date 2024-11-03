"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FloatingLabelInput from "./FloatingLabelInput";
import { useState } from "react";
import Link from "next/link";
import { signIn, signUp } from "../hooks/useFirebaseAuth";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";
import { GoogleLoginButton } from "react-social-login-buttons";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "@/utils/firebase";
const provider = new GoogleAuthProvider();
interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  form: "login" | "signup";
}

// Zod schemas for form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

const signupSchema = loginSchema
  .extend({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" })
      .max(20, {
        message: "Username must be at most 20 characters long",
      }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || "default_secret_key";
const stringToArrayBuffer = (str: string) => new TextEncoder().encode(str);
// Function to encrypt the password
const encryptPassword = async (password: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    stringToArrayBuffer(secretKey), // Replace with an environment variable for production
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const iv = new Uint8Array(secretKey.length); // Initialization vector
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    stringToArrayBuffer(password),
  );

  // Combine IV and encrypted data
  return {
    iv: Buffer.from(iv).toString("hex"),
    encrypted: Buffer.from(new Uint8Array(encrypted)).toString("hex"),
  };
};

export function UserAuthForm({ className, form, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [signInWithGoogle] = useSignInWithGoogle(auth);

  const schema = form === "login" ? loginSchema : signupSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleSignIn = async (data: { email: string; password: string }) => {
    try {
      const { encrypted } = await encryptPassword(data.password);
      await signIn(data.email, `${encrypted}`);
      router.replace("/counters");
    } catch {
      setError("Invalid email or password");
    }
  };

  const handleSignUp = async (data: {
    email: string;
    password: string;
    username: string;
  }) => {
    try {
      const { encrypted } = await encryptPassword(data.password);
      const userCredential = await signUp(data.email, `${encrypted}`);
      const user = userCredential.user;
      await updateProfile(user, { displayName: data.username });
      router.replace("/dashboard");
    } catch {
      setError("Failed to create an account");
    }
  };

  const onSubmit = (data: any) => {
    setIsLoading(true);
    if (form === "login") {
      handleSignIn(data);
    } else if (form === "signup") {
      handleSignUp(data);
    }
    setIsLoading(false);
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          {form === "signup" && (
            <div className="grid gap-1">
              <FloatingLabelInput
                label={"Username"}
                id={"name"}
                placeholder="username"
                type="text"
                className="border-brand-primary"
                {...register("username")}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message?.toString()}
                </span>
              )}
            </div>
          )}
          <div className="grid gap-1">
            <FloatingLabelInput
              label={"Email"}
              id={"email"}
              placeholder="name@gmail.com"
              type="email"
              className="border-brand-primary"
              {...register("email")}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message?.toString()}
              </span>
            )}
          </div>
          <div className="grid gap-1">
            <FloatingLabelInput
              label={"Password"}
              id={"password"}
              placeholder="********"
              type="password"
              className="border-brand-primary"
              {...register("password")}
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message?.toString()}
              </span>
            )}
          </div>
          {form === "signup" && (
            <div className="grid gap-1">
              <FloatingLabelInput
                label={"Confirm Password"}
                id={"confirm-password"}
                placeholder="********"
                type="password"
                className="border-brand-primary"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <span className="text-red-500 text-sm">
                  {errors.confirmPassword.message?.toString()}
                </span>
              )}
            </div>
          )}

          <Button disabled={isLoading} className="bg-brand-primary">
            {form === "signup" && "Sign Up"}
            {form === "login" && " Sign In with Email"}
          </Button>
        </div>
      </form>
      {form === "login" && (
        <div className="flex flex-row gap-2 justify-center">
          <span className="text-sm">Don&apos;t have an account?</span>
          <Link
            href={"/signup"}
            className="text-brand-primary text-sm font-semibold underline underline-offset-4"
          >
            Sign Up
          </Link>
        </div>
      )}
      {form === "signup" && (
        <div className="flex flex-row gap-2 justify-center">
          <span className="text-sm">Already have an account?</span>
          <Link
            href={"/login"}
            className="text-brand-primary text-sm font-semibold underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      {/* {isLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.gitHub className="mr-2 h-4 w-4" />
              )}{" "} */}
      <GoogleLoginButton
        onClick={() => signInWithGoogle()}
        className="max-w-max !mx-auto"
        style={{
          fontSize: "14px",
        }}
      />
    </div>
  );
}
