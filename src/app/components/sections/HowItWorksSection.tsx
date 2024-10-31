import React from "react";

const howItWorksData = [
  {
    heading: "Step 1",
    subheading: "Sign Up or Log In",
    description:
      "Create an account or sign in to start managing your sections and seats.",
  },
  {
    heading: "Step 2",
    subheading: "Create Sections",
    description:
      "Easily add new sections for your event or venue with a single click.",
  },
  {
    heading: "Step 3",
    subheading: "Manage Counts",
    description:
      "Adjust seat counts in real-time by incrementing or decrementing as people enter or exit.",
  },
  {
    heading: "Step 4",
    subheading: "Real-time Sync",
    description:
      "Watch updates reflect instantly across all devices for seamless coordination.",
  },
  {
    heading: "Step 5",
    subheading: "Monitor and Manage",
    description:
      "Keep an eye on all sections with live updates and manage them easily from your dashboard.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0">
        <h2 className="text-base font-bold text-center text-brand-primary">
          <div className="flex flex-col gap-5">
            <span>How it works</span>
            <span className="text-black font-semibold text-4xl">
              A simple guide to using Tally for efficient
              <br className="sm:inline-block my-4" />
              <span className="lg:mt-2 inline-block">
                seating and section management.
              </span>
            </span>
          </div>
        </h2>
        <div className="py-14 lg:py-20 mt-14 lg:mt-20 flex flex-col gap-8">
          {howItWorksData.map((steps) => (
            <div key={steps.heading} className={`lg:w-1/2  lg:pl-10`}>
              <h2 className="text-base font-bold text-brand-primary">
                {steps.heading}:
              </h2>
              <div className="flex flex-col mt-5 gap-5">
                <h3 className="text-3xl font-semibold mb-1">
                  {steps.subheading}
                </h3>
                <p className="text-gray-700 text-base">{steps.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
