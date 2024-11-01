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
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "./LoadingScreen";

const publicRoutes = ["/login", "/signup", "/demo"];
const privateRoutes = ["/counters", "/dashboard"];
export const ProtectedLayout: FC<PropsWithChildren> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return <Loading />;
  } else {
    if (privateRoutes.includes(pathname)) {
      if (!user) {
        router.replace("/login");
      }
    }
    if (user && publicRoutes.includes(pathname)) {
      router.replace("/dashboard");
    }

    return <>{children}</>;
  }
};

export default ProtectedLayout;
