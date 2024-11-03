"use client";

import React, { useState, useEffect, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnimatedNumberDisplayProps {
    value: number;
    duration?: number;
    className?: string;
}

export const AnimatedNumberDisplay = memo(
    ({
        value,
        duration = 1500,
        className = "",
    }: AnimatedNumberDisplayProps) => {
        const [displayValue, setDisplayValue] = useState<number | null>(null);
        const [isAnimating, setIsAnimating] = useState(true);

        useEffect(() => {
            let startTime: number;
            let animationFrame: number;

            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const progress = timestamp - startTime;

                if (progress < duration / 3) {
                    // Show skeleton for first third of duration
                    setDisplayValue(null);
                } else if (progress < (duration * 2) / 3) {
                    // Show 0 for second third of duration
                    setDisplayValue(0);
                } else if (progress < duration) {
                    // Animate from 0 to final value in last third of duration
                    const animationProgress =
                        (progress - (duration * 2) / 3) / (duration / 3);
                    setDisplayValue(Math.round(animationProgress * value));
                } else {
                    // Animation complete
                    setDisplayValue(value);
                    setIsAnimating(false);
                    return;
                }

                animationFrame = requestAnimationFrame(animate);
            };

            animationFrame = requestAnimationFrame(animate);

            return () => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
            };
        }, [value, duration]);

        return (
            <span className={`inline-block min-h-4 ${className}`}>
                {isAnimating && displayValue === null ? (
                    <Skeleton className="h-6 w-full" />
                ) : (
                    displayValue
                )}
            </span>
        );
    }
);

AnimatedNumberDisplay.displayName = "AnimatedNumberDisplay";
export default AnimatedNumberDisplay;
