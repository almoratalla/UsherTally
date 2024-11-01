"use client";
// src/pages/signin.tsx

import React from "react";
import Header from "@/app/components/Header";
import Link from "next/link";
import { UserAuthForm } from "@/app/components/UserAuthForm";

const LoginInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white h-screen">
      <Header />
      <div className="p-4 py-12 lg:p-8 lg:py-40 my-auto h-auto">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] my-auto">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <UserAuthForm form="login" />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginInPage;
