import * as React from "react";
import { cn } from "../lib/cn";
import { ChevronDown } from "lucide-react";

type Tab = {
  label: string;
  value: string;
};

type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export function PaymentSection() {
  const tabs: Tab[] = [
    { label: "Overview", value: "overview" },
    { label: "Import", value: "import" },
    { label: "Export", value: "export" },
    { label: "Payment", value: "payment" },
    { label: "Local solutions", value: "local" },
  ];

  const [activeTab, setActiveTab] = React.useState<string>("overview");
  const [openId, setOpenId] = React.useState<string | null>(null);

  // Reset accordion when tab changes
  React.useEffect(() => {
    setOpenId(null);
  }, [activeTab]);

  const tabContent = {
    overview: {
      title: "Overview",
      description: "Comprehensive logistics solutions for shipping to and from Rwanda",
      items: [
        {
          id: "services",
          title: "Our Services",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                UZA Logistics provides end-to-end logistics solutions including shipment tracking, 
                warehouse management, and comprehensive logistics support for businesses shipping 
                to and from Rwanda.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm leading-6">
                <li>Real-time shipment tracking and monitoring</li>
                <li>Efficient warehouse management systems</li>
                <li>Multiple transport options (Air, Sea, Road)</li>
                <li>24/7 customer support</li>
              </ul>
            </div>
          ),
        },
        {
          id: "coverage",
          title: "Coverage Areas",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                We provide comprehensive logistics coverage across Rwanda and international 
                shipping routes, connecting businesses with global markets through our 
                extensive network of partners and facilities.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Domestic Coverage</h4>
                  <p className="text-xs text-slate-600">All major cities and regions in Rwanda</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">International Routes</h4>
                  <p className="text-xs text-slate-600">Connections to major global markets</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "technology",
          title: "Technology & Innovation",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                We leverage cutting-edge technology to provide real-time tracking, automated 
                notifications, and seamless integration with your business systems.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Real-time Tracking</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">API Integration</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Mobile App</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Cloud Platform</span>
              </div>
            </div>
          ),
        },
      ],
    },
    import: {
      title: "Import",
      description: "Streamlined import processes and documentation for shipments to Rwanda",
      items: [
        {
          id: "import-process",
          title: "Import Process",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                Our import services simplify the process of bringing goods into Rwanda. 
                We handle all necessary documentation and customs clearance procedures.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm leading-6">
                <li>Customs clearance and documentation</li>
                <li>Import duty calculation and payment</li>
                <li>Port handling and warehousing</li>
                <li>Last-mile delivery to your location</li>
              </ul>
            </div>
          ),
        },
        {
          id: "import-docs",
          title: "Required Documentation",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                We assist with all required import documentation including commercial invoices, 
                packing lists, certificates of origin, and any special permits required for 
                your specific goods.
              </p>
              <div className="space-y-3 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-600 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Commercial Invoice</p>
                    <p className="text-xs text-slate-600">Detailed invoice with product descriptions and values</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-600 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Packing List</p>
                    <p className="text-xs text-slate-600">Complete list of all items in the shipment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-600 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Certificate of Origin</p>
                    <p className="text-xs text-slate-600">Documentation proving the origin of goods</p>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "import-timeline",
          title: "Import Timeline",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-6">
                Our streamlined import process typically follows this timeline:
              </p>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <div>
                      <p className="text-sm font-medium">Documentation Review</p>
                      <p className="text-xs text-slate-600 mt-1">1-2 business days</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                    <div>
                      <p className="text-sm font-medium">Customs Clearance</p>
                      <p className="text-xs text-slate-600 mt-1">2-3 business days</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <div>
                      <p className="text-sm font-medium">Delivery</p>
                      <p className="text-xs text-slate-600 mt-1">1-2 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    export: {
      title: "Export",
      description: "Efficient export services to help your products reach global markets",
      items: [
        {
          id: "export-process",
          title: "Export Process",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                Our export services ensure your products reach international markets efficiently 
                and on time. We handle all export formalities and documentation.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm leading-6">
                <li>Export documentation and certification</li>
                <li>Compliance with international trade regulations</li>
                <li>Packaging and labeling services</li>
                <li>Coordination with international carriers</li>
              </ul>
            </div>
          ),
        },
        {
          id: "export-support",
          title: "Export Support Services",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                We provide comprehensive support including market research assistance, 
                regulatory compliance guidance, and connections with international buyers 
                and distributors.
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-900 mb-2">Expert Consultation Available</p>
                <p className="text-xs text-blue-700">
                  Our export specialists are available to guide you through the entire export process, 
                  from documentation to market entry strategies.
                </p>
              </div>
            </div>
          ),
        },
        {
          id: "export-markets",
          title: "Target Markets",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                We facilitate exports to key international markets with established trade routes 
                and partnerships.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">EU</p>
                  <p className="text-xs text-slate-600 mt-1">European Union</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">US</p>
                  <p className="text-xs text-slate-600 mt-1">United States</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">EA</p>
                  <p className="text-xs text-slate-600 mt-1">East Africa</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">ASIA</p>
                  <p className="text-xs text-slate-600 mt-1">Asia Pacific</p>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    payment: {
      title: "Payment",
      description: "Get an overview of payment options when shipping",
      items: [
        {
          id: "rate",
          title: "Rate of exchange",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                Currency conversion rates can vary by bank and payment channel. If you
                pay in a different currency than the invoice, your bank may apply
                additional fees.
              </p>
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs font-medium text-amber-900 mb-1">💡 Tip</p>
                <p className="text-xs text-amber-800">
                  Check current exchange rates before making payments to avoid unexpected charges. 
                  Our team can provide rate estimates upon request.
                </p>
              </div>
            </div>
          ),
        },
        {
          id: "myfinance",
          title: "MyFinance",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                MyFinance significantly reduces your paperwork and gives you a simple
                overview of your invoices and accounts.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span>Automated invoice management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span>Real-time account balance tracking</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span>Payment history and reports</span>
                </div>
              </div>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
              >
                Read more →
              </a>
            </div>
          ),
        },
        {
          id: "payment-methods",
          title: "Payment Methods",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                We accept multiple payment methods to make transactions convenient for our clients.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm leading-6">
                <li>Bank transfers (local and international)</li>
                <li>Credit and debit cards</li>
                <li>Mobile money payments</li>
                <li>Letter of Credit (L/C)</li>
              </ul>
            </div>
          ),
        },
      ],
    },
    local: {
      title: "Local Solutions",
      description: "Tailored logistics solutions for local businesses in Rwanda",
      items: [
        {
          id: "local-services",
          title: "Local Services",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                Our local solutions are designed specifically for businesses operating within 
                Rwanda, offering cost-effective and efficient logistics services.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm leading-6">
                <li>Intra-city delivery services</li>
                <li>Inter-city transportation</li>
                <li>Local warehousing and storage</li>
                <li>Same-day and next-day delivery options</li>
              </ul>
            </div>
          ),
        },
        {
          id: "local-partners",
          title: "Local Partnerships",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6 mb-4">
                We work with local businesses, suppliers, and distributors to provide 
                seamless logistics solutions that support the Rwandan economy and help 
                local businesses grow.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">SME Support</span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">Supplier Network</span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">Distribution Partners</span>
              </div>
            </div>
          ),
        },
        {
          id: "local-support",
          title: "Local Support",
          content: (
            <div className="text-slate-700">
              <p className="max-w-3xl text-sm leading-6">
                Our team of local experts understands the Rwandan market and can provide 
                personalized support in Kinyarwanda, English, and French to ensure clear 
                communication and excellent service.
              </p>
            </div>
          ),
        },
      ],
    },
  };

  const currentContent = tabContent[activeTab as keyof typeof tabContent];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-2 sm:px-3 lg:px-8 xl:px-12 py-10">
        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex flex-wrap gap-8">
            {tabs.map((t) => {
              const isActive = t.value === activeTab;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setActiveTab(t.value)}
                  className={cn(
                    "relative py-3 text-sm font-medium text-slate-700 hover:text-slate-900",
                    isActive && "text-slate-900"
                  )}
                >
                  {t.label}
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Header */}
        <div className="pt-10">
          <h1 className="text-4xl font-light tracking-tight text-slate-900 sm:text-5xl">
            {currentContent.title}
          </h1>
          <p className="mt-4 text-sm text-slate-700">
            {currentContent.description}
          </p>
        </div>

        {/* Accordion */}
        <div key={activeTab} className="mt-10 divide-y divide-slate-200 border-t border-slate-200">
          {currentContent.items.map((it) => {
            const isOpen = openId === it.id;
            return (
              <div key={it.id} className="py-6">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : it.id)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-base font-medium text-slate-900">
                    {it.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-slate-500 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {isOpen && <div className="mt-6">{it.content}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
