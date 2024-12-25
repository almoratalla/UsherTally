import Header from "@/app/components/Header";
import SettingsForm from "@/app/components/settings/SettingsForm";
import SettingsSideBar from "@/app/components/settings/SettingsSideBar";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings?tab=profile",
  },
  {
    title: "Account",
    href: "/settings?tab=account",
  },
  {
    title: "Appearance",
    href: "/settings?tab=appearance",
  },
  {
    title: "Notifications",
    href: "/settings?tab=notifications",
  },
  {
    title: "Display",
    href: "/settings?tab=display",
  },
  {
    title: "Billing",
    href: "/settings?tab=billing",
  },
  {
    title: "Projects",
    href: "/settings?tab=projects",
  },
];

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-6 2xl:px-0">
        <main className="flex flex-col py-12 min-h-screen bg-gray-100 gap-8">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Manage your account settings and set e-mail preferences.
            </p>
          </div>

          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="lg:w-1/5">
              <SettingsSideBar items={sidebarNavItems} />
            </aside>
            <div className="flex-1 lg:max-w-2xl">
              <SettingsForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
