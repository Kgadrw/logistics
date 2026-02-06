import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { PaymentSection } from "../components/Pricing";
import HelpCards from "../components/FeaturesSection";
import { Footer } from "../components/Footer";

import type { Role } from "../lib/types";
import { cn } from "../lib/cn";

type ServiceItem = {
  index: string; // "07"
  title: string; // supports \n
};

const SERVICES: ServiceItem[] = [
  { index: "01", title: "Direct Factory\nSourcing (UZA Bulk)" },
{ index: "02", title: "Global Logistics &\nFreight (UZA Logistics)" },
{ index: "03", title: "B2B Digital\nMarketplace (UZA Mall)" },
{ index: "04", title: "SME Financing &\nImpact Programs (UZA Empower)" },
{ index: "05", title: "Trade Intelligence &\nAI Tools" },
{ index: "06", title: "Cloud Trade\nInfrastructure (UZA Cloud)" },

];

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function RoleSwitch() {
  // Services slider
  const pages = React.useMemo(() => chunk(SERVICES, 4), []);
  const [page, setPage] = React.useState(0);

  const prev = () => setPage((p) => (p === 0 ? pages.length - 1 : p - 1));
  const next = () => setPage((p) => (p === pages.length - 1 ? 0 : p + 1));

  return (
    <div className="min-h-dvh bg-white">
      <Header />
      <Hero />
      <HelpCards />
      <PaymentSection />
      {/* === OUR SERVICES (boxed like hero) === */}
      <section className="relative py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-2 sm:px-3 lg:px-8 xl:px-12">
        <div className="relative overflow-hidden bg-[#213546] text-white">

            {/* subtle vertical grid lines */}
            <div className="pointer-events-none absolute inset-0 opacity-25">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(246, 172, 64, 0.14)_1px,transparent_1px)] bg-[size:320px_100%]" />
            </div>

            <div className="relative px-2 sm:px-3 lg:px-8 xl:px-12 py-10 sm:py-14 lg:py-16">
              {/* top row */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold tracking-widest text-white/80">
                  OUR SERVICES
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={prev}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur hover:bg-white/15"
                    aria-label="Previous"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur hover:bg-white/15"
                    aria-label="Next"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* columns */}
              <div className="mt-10 grid grid-cols-1 gap-0 border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">
                {pages[page].map((s, idx) => (
                  <div
                    key={`${s.index}-${idx}`}
                    className={cn(
                      "min-h-[340px] px-4 py-10 sm:px-6",
                      "border-white/15",
                      "border-t sm:border-t-0", // row separators on small screens
                      idx === 0 ? "" : "lg:border-l", // vertical separators (desktop)
                      idx % 2 === 1 ? "sm:border-l" : "" // vertical separators (tablet 2-col)
                    )}
                  >
                    <div className="text-[#f5ac42] text-sm font-semibold tracking-widest">
                      {s.index}
                    </div>

                    <h3 className="mt-6 whitespace-pre-line text-3xl font-light leading-snug">
                      {s.title}
                    </h3>
                  </div>
                ))}

                {/* fill empty slots if last page has < 4 items */}
                {pages[page].length < 4 &&
                  Array.from({ length: 4 - pages[page].length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="hidden lg:block min-h-[340px] border-l border-white/15 px-6 py-10"
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      

      <Footer />
    </div>
  );
}
