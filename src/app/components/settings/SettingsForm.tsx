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
import NotificationSettingsForm from "./NotificationSettingsForm";
import BillingSettingsForm from "./BillingSettingsForm";
import ReportSettings from "./ReportSettings";
import ProjectSettings from "./ProjectSettings";

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
            {tab === "notifications" && (
                <NotificationSettingsForm
                    user={activeUser}
                    preferences={activePreferences}
                />
            )}
            {tab === "billing" && <BillingSettingsForm />}
            {tab === "projects" && (
                <ProjectSettings
                    projectName={""}
                    features={[
                        { id: "1", name: "Dashboard" },
                        { id: "2", name: "Reports" },
                        { id: "3", name: "Settings" },
                        { id: "4", name: "User Management" },
                        { id: "5", name: "Analytics" },
                        // Add more features as needed
                    ]}
                    initialUsers={[
                        {
                            id: "1",
                            name: "John Doe",
                            email: "john@example.com",
                            role: "Admin",
                            featurePermissions: [
                                { featureId: "1", permission: "Editor" },
                                { featureId: "2", permission: "Editor" },
                                { featureId: "3", permission: "Editor" },
                                { featureId: "4", permission: "Editor" },
                                { featureId: "5", permission: "Editor" },
                            ],
                        },
                        {
                            id: "2",
                            name: "Jane Smith",
                            email: "jane@example.com",
                            role: "Moderator",
                            featurePermissions: [
                                { featureId: "1", permission: "Viewer" },
                                { featureId: "2", permission: "Editor" },
                                { featureId: "3", permission: "Viewer" },
                                { featureId: "4", permission: "Editor" },
                                { featureId: "5", permission: "Viewer" },
                            ],
                        },
                        {
                            id: "3",
                            name: "Bob Johnson",
                            email: "bob@example.com",
                            role: "Member",
                            featurePermissions: [
                                { featureId: "1", permission: "Viewer" },
                                { featureId: "2", permission: "Viewer" },
                                { featureId: "3", permission: "None" },
                                { featureId: "4", permission: "Viewer" },
                                { featureId: "5", permission: "None" },
                            ],
                        },
                    ]}
                />
            )}
            {tab === "report" && <ReportSettings user={activeUser} />}
        </div>
    );
};

export default SettingsForm;
