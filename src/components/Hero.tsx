import * as React from "react";
import { Link } from "react-router-dom";
import { Share2 } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/cn";

type HeroProps = {
  title?: string;
  subtitle?: string;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  backgroundImageUrl?: string; // put your container image here
};

export function Hero({
  title = "Shipping to and from\nRwanda",
  subtitle = "Your complete guide to shipping to and from Rwanda. Find the right route, get office locations, discover local solutions, payment options and more.",
  primaryCta = { label: "Find schedules", to: "/schedules" },
  secondaryCta = { label: "Find a price", to: "/pricing" },
  backgroundImageUrl = "/hero.jpg",
}: HeroProps) {
  return (
    <section className="relative w-full min-h-[60vh]">
      {/* Hero Shell */}
      <div className="relative w-full h-full min-h-[60vh] overflow-hidden bg-slate-900 rounded-b-[52px]">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />

          {/* Dark overlay + subtle diagonal */}
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

          {/* Top-right Share */}
         

          {/* Feedback tab (right side) - hidden on mobile */}
          

          {/* Content */}
          <div className="relative z-10 h-full min-h-[60vh] flex items-center px-2 sm:px-3 lg:px-8 xl:px-12">
            <div className="mx-auto max-w-6xl w-full">
              <div className="max-w-2xl">
              <h1 className="whitespace-pre-line text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light leading-tight text-white">
                {title}
              </h1>

              <p className="mt-4 sm:mt-6 max-w-xl text-xs sm:text-sm md:text-base leading-6 text-white/85">
                {subtitle}
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col items-start gap-2 sm:gap-3 sm:flex-row sm:items-center">
                <Link to={primaryCta.to} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-[#f5ac3f] text-white hover:bg-[#23364a]/90"
                  >
                    {primaryCta.label}
                  </Button>
                </Link>

                <Link to={secondaryCta.to} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="ghost"
                    className={cn(
                      "w-full sm:w-auto",
                      "border border-white/50 text-white hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {secondaryCta.label}
                  </Button>
                </Link>
              </div>
              </div>
            </div>
          </div>

          {/* Bottom blue band */}
          <div className="absolute bottom-0 left-0 right-0">
            {/* blue strip */}
            <div className="h-8 sm:h-10 lg:h-12 bg-[#233549]" />
          </div>
        </div>
    </section>
  );
}
