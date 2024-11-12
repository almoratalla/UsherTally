import { useEffect } from "react";

export const useRouteChangePrompt = (unsavedChanges: boolean) => {
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (unsavedChanges) {
                // Show a confirmation message when the user tries to leave the page
                const message =
                    "You have unsaved changes. Are you sure you want to leave?";
                event.returnValue = message; // Standard for most browsers
                return message; // For some browsers like Chrome
            }
        };

        const handleRouteChange = (event: PopStateEvent) => {
            if (unsavedChanges) {
                // Show confirmation dialog when navigating away
                const confirmLeave = window.confirm(
                    "You have unsaved changes. Are you sure you want to leave?"
                );
                if (!confirmLeave) {
                    event.preventDefault();
                }
            }
        };

        // Listen for browser unload (closing tab or refreshing)
        window.addEventListener("beforeunload", handleBeforeUnload);

        // Listen for changes in history (such as clicking on a link)
        window.addEventListener("popstate", handleRouteChange);

        // Cleanup event listeners on component unmount
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handleRouteChange);
        };
    }, [unsavedChanges]);
};
