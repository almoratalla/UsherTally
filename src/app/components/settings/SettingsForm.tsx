"use client";

import { useSearchParams } from "next/navigation";
import React from "react";
import ProfileSettingsForm from "./ProfileSettingsForm";

const SettingsForm = () => {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");
    return <div>{tab === "profile" && <ProfileSettingsForm />}</div>;
};

export default SettingsForm;
