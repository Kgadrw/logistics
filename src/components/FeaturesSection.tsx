import React from "react";
import { Search, CalendarDays, Mail } from "lucide-react";

export default function HelpCards() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-6xl px-2 sm:px-3 lg:px-8 xl:px-12 py-10">
        {/* Title */}
        <h2 className="text-4xl font-light tracking-tight text-slate-900">
          Anything you need, we&apos;re here to help
        </h2>

        {/* Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-md border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200">
                <Search className="h-5 w-5 text-slate-700" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  Ready to ship?
                </h3>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Look up rates for new shipments and inland tariffs.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-sm bg-[#223448] px-4 py-2 text-sm font-medium text-white hover:bg-slate-900">
                    Find a price
                  </button>
                  <button className="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50">
                    Book now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-md border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200">
                <CalendarDays className="h-5 w-5 text-slate-700" />
              </div>

              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Find schedules
                  </h3>
                  <span className="text-xs text-slate-500">1/2</span>
                </div>

                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Origin (City, Country/Region)"
                    className="h-10 w-full rounded-sm border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div className="mt-5">
                  <button className="rounded-sm bg-[#223448] px-6 py-2 text-sm font-medium text-white hover:bg-slate-900">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-md border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200">
                <Mail className="h-5 w-5 text-slate-700" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  Sales enquiries
                </h3>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Contact us and we will respond within the next two working days.
                </p>

                <div className="mt-5">
                  <button className="rounded-sm bg-[#223448] px-6 py-2 text-sm font-medium text-white hover:bg-slate-900">
                    Enquire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* subtle bottom rule like screenshot */}
        <div className="mt-10 h-px w-full bg-slate-200" />
      </div>
    </section>
  );
}
