"use client";

import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import ProfileSettingsForm from "./ProfileSettingsForm";
import { useActiveUser } from "@/app/hooks/useActiveUser";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/utils/firebase";
import { iActiveUser } from "@/app/lib/definitions";
import AccountSettingsForm from "./AccountSettingsForm";
import AppearanceSettingsForm from "./AppearanceSettingsForm";

const SettingsForm = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const {
    activeUser,
    activePreferences,
    checkAuth,
    setActiveUser,
    setActivePreferences,
  } = useActiveUser();
  const [authStateUser] = useAuthState(auth);

  const checkAuthUser = useCallback(async () => {
    const { user, preferences } = await checkAuth(authStateUser?.uid ?? "");
    setActiveUser(user);
    setActivePreferences(preferences);
  }, [authStateUser?.uid, checkAuth, setActiveUser]);

  useEffect(() => {
    if (!activeUser) {
      checkAuthUser();
    }
  }, [checkAuthUser, activeUser]);

  return (
    <div>
      {tab === "profile" && (
        <ProfileSettingsForm
          user={activeUser}
          preferences={activePreferences}
        />
      )}
      {(tab === "account" || !tab) && (
        <AccountSettingsForm
          user={activeUser}
          preferences={activePreferences}
        />
      )}
      {(tab === "appearance" || !tab) && (
        <AppearanceSettingsForm
          user={activeUser}
          preferences={activePreferences}
        />
      )}
    </div>
  );
};

export default SettingsForm;
