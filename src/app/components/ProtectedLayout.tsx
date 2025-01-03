"use client";
import { auth } from "@/utils/firebase";
import { usePathname, useRouter } from "next/navigation";
import React, {
  FC,
  PropsWithChildren,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import Loading from "./LoadingScreen";

const publicRoutes = ["/login", "/signup", "/demo", "/"];
const privateRoutes = ["/counters", "/dashboard", "/settings"];
export const ProtectedLayout: FC<PropsWithChildren> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [_, googleUser, googleUserLoading] = useSignInWithGoogle(auth);
  const router = useRouter();
  const pathname = usePathname();

  if (loading || googleUserLoading) {
    if (googleUserLoading) {
      setTimeout(() => {}, 5000);
    }
    return <Loading />;
  } else {
    if (privateRoutes.includes(pathname)) {
      if (!user) {
        router.replace("/login");
      }
    }
    if ((user || googleUser) && publicRoutes.includes(pathname)) {
      if (googleUser) {
        setTimeout(() => {}, 5000);
      }
      router.replace("/dashboard");
    }

    return <>{children}</>;
  }
};

export default ProtectedLayout;
