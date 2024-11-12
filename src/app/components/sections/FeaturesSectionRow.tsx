"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { FC, PropsWithChildren, useState } from "react";
import { featuresSectionData } from "./FeaturesSection";

export const FeaturesSectionRow: FC<
    PropsWithChildren & {
        feature: (typeof featuresSectionData)[number];
        index: number;
    }
> = ({ feature, index }) => {
    const [loading, setLoading] = useState(false);
    return (
        <div
            key={feature.id}
            className={`flex flex-col lg:flex-row gap-8 lg:gap-0 items-center mb-12 ${index % 2 === 0 ? "" : "lg:flex-row-reverse"}`}
        >
            <div className="lg:w-1/2 relative h-[400px] w-full">
                {loading && (
                    <Skeleton className="w-full h-[400px] rounded-lg bg-gray-200" />
                )}
                <div className={cn(loading ? "hidden" : "visible")}>
                    <AspectRatio
                        ratio={16 / 9}
                        className={cn(loading ? "hidden" : "visible")}
                    >
                        <Image
                            src={feature.image}
                            alt={feature.heading}
                            layout="responsive"
                            width={132}
                            height={132}
                            className={cn(
                                "rounded-lg",
                                loading ? "hidden" : "visible"
                            )}
                            onLoadingComplete={() => setLoading(false)}
                            onError={() => setLoading(true)}
                            unoptimized={true}
                        />
                    </AspectRatio>
                </div>
            </div>
            <div className={`lg:w-1/2 ${index % 2 !== 0 ? "" : "lg:pl-10"}`}>
                <h2 className="text-base font-bold text-brand-primary">
                    {feature.heading}
                </h2>
                <div className="flex flex-col mt-5 gap-5">
                    <h3 className="text-4xl font-semibold mb-1">
                        {feature.subheading}
                    </h3>
                    <p className="text-gray-700 text-base">
                        {feature.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeaturesSectionRow;
