import FeaturesSectionRow from "./FeaturesSectionRow";

export const featuresSectionData = [
    {
        id: 1,
        image: "./realtime.gif",
        heading: "Real-time Updates",
        subheading: "Stay informed with live updates on attendee counts.",
        description:
            "Instantly sync changes across all users, ensuring up-to-date information at all times.",
    },
    {
        id: 2,
        image: "/manage.gif",
        heading: "Easy Section Management",
        subheading: "Effortlessly manage and organize seating sections.",
        description:
            "Effortlessly add, rename, or remove sections with intuitive controls and a user-friendly interface.",
    },
    {
        id: 3,
        image: "/auth.gif",
        heading: "Secure Authentication",
        subheading: "Ensure data security with robust authentication features.",
        description:
            "Protect your data with robust authentication, ensuring only authorized users can make changes.",
    },
];
const FeaturesSection = () => {
    return (
        <section className="py-28 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0">
                <h2 className="text-base font-bold text-center text-brand-primary">
                    <div className="flex flex-col gap-5">
                        <span>Features</span>
                        <span className="text-black font-semibold text-4xl">
                            Discover the powerful capabilities of Tally
                            <br className="sm:inline-block my-4" />
                            <span className="lg:mt-2 inline-block">
                                to streamline your event management.
                            </span>
                        </span>
                    </div>
                </h2>
                <div className="py-14 lg:py-28 mt-14 lg:mt-28 flex flex-col gap-8">
                    {featuresSectionData.map(
                        (
                            feature: (typeof featuresSectionData)[number],
                            index
                        ) => (
                            <FeaturesSectionRow
                                key={feature.id}
                                feature={feature}
                                index={index}
                            />
                        )
                    )}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
