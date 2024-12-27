import Header from "@/app/components/Header";
import CountersPanel from "@/app/components/panels/counters-panel";

const isLoggedIn = true;

const Counters = () => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <CountersPanel />
        </div>
    );
};

export default Counters;
