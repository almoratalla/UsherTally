import Header from "@/app/components/Header";
import DashboardPanel from "@/app/components/panels/dashboard-panel";

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <DashboardPanel />
        </div>
    );
};

export default Dashboard;
