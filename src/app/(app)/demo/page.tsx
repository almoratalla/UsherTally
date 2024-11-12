import Header from "@/app/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardPanel from "@/app/components/panels/dashboard-panel";
import CountersPanel from "@/app/components/panels/counters-panel";
import PlannerPanel from "@/app/components/panels/planner-panel";

const DemoPage = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0">
                <main className="flex flex-col py-12 min-h-screen bg-gray-100 gap-8">
                    <section className="flex flex-col items-start gap-2">
                        <div className="flex justify-between items-center w-full">
                            <h1 className="text-4xl font-bold ">
                                Demo Dashboard
                            </h1>
                        </div>
                    </section>
                    <section>
                        <Tabs defaultValue="dashboard" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="dashboard">
                                    Dashboard
                                </TabsTrigger>
                                <TabsTrigger value="counters">
                                    Counters
                                </TabsTrigger>
                                <TabsTrigger value="planner">
                                    Planner
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent
                                value="dashboard"
                                className="space-y-4"
                            >
                                <DashboardPanel />
                            </TabsContent>
                            <TabsContent value="counters" className="space-y-4">
                                <CountersPanel />
                            </TabsContent>
                            <TabsContent value="planner" className="space-y-4">
                                <PlannerPanel />
                            </TabsContent>
                        </Tabs>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default DemoPage;
