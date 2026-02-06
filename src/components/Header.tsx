import * as React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Menu,
  X,
  Globe,
  Search,
  Bell,
  HelpCircle,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/cn";
import { LoginModal } from "./LoginModal";
import { RegistrationModal } from "./RegistrationModal";

const NavItem = ({
  label,
  to,
  hasDropdown,
}: {
  label: string;
  to?: string;
  hasDropdown?: boolean;
}) => {
  const content = (
    <span className="inline-flex items-center gap-1">
      {label}
      {hasDropdown ? <ChevronDown className="h-4 w-4 opacity-70" /> : null}
    </span>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="text-sm font-medium text-slate-800 hover:text-brand-600 transition-colors"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="text-sm font-medium text-slate-800 hover:text-brand-600 transition-colors"
    >
      {content}
    </button>
  );
};

const UtilityItem = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-brand-600 transition-colors"
  >
    <Icon className="h-4 w-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showNotice, setShowNotice] = React.useState(true);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      {/* Top Notice Bar (yellow) */}
     

      {/* Main Header Row */}
      <div className="mx-auto max-w-7xl px-2 sm:px-3 lg:px-8 xl:px-12">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-brand-600">
              <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-base sm:text-lg font-bold text-slate-900">
                UZA Logistics
              </span>
              <span className="text-xs text-slate-500">Shipment Solutions</span>
            </div>
          </Link>

          {/* Utility Links (desktop) */}
        

          {/* CTA Buttons (desktop) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs sm:text-sm"
              onClick={() => setRegistrationModalOpen(true)}
            >
              Register
            </Button>
            <Button 
              size="sm" 
              className="text-xs sm:text-sm"
              onClick={() => setLoginModalOpen(true)}
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Second Row Navigation (Maersk-style) */}
      <div className="hidden md:block  border-slate-200">
        <div className="mx-auto max-w-7xl px-2 sm:px-3 lg:px-8 xl:px-12">
          <nav className="flex h-11 sm:h-12 items-center gap-3 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide">
            <NavItem label="Prices" to="/prices" />
            <NavItem label="Book" hasDropdown />
            <NavItem label="Schedules" to="/schedules" />
            <NavItem label="Tracking" to="/tracking" />
            <NavItem label="Manage" hasDropdown />
            <NavItem label="Services" hasDropdown />
            <NavItem label="Company" hasDropdown />
          </nav>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden  border-slate-200 bg-white max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="mx-auto max-w-7xl px-2 sm:px-3 lg:px-8 xl:px-12 py-4 space-y-4">
            {/* Utility links (mobile) */}
            <div className="flex flex-wrap items-center gap-4">
              <UtilityItem icon={Globe} label="EN" />
              <UtilityItem icon={Search} label="Search" />
              <UtilityItem icon={Bell} label="Notifications" />
              <UtilityItem icon={HelpCircle} label="Support" />
              <UtilityItem icon={MessageSquare} label="Contact Us" />
            </div>

            <div className="h-px bg-slate-200" />

            {/* Nav (mobile) */}
            <nav className="flex flex-col gap-3">
              <Link
                to="/prices"
                className="text-sm font-medium text-slate-800 hover:text-brand-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prices
              </Link>

              <button className="text-left text-sm font-medium text-slate-800 hover:text-brand-600">
                Book
              </button>

              <Link
                to="/schedules"
                className="text-sm font-medium text-slate-800 hover:text-brand-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Schedules
              </Link>

              <Link
                to="/tracking"
                className="text-sm font-medium text-slate-800 hover:text-brand-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tracking
              </Link>

              <button className="text-left text-sm font-medium text-slate-800 hover:text-brand-600">
                Manage
              </button>
              <button className="text-left text-sm font-medium text-slate-800 hover:text-brand-600">
                Services
              </button>
              <button className="text-left text-sm font-medium text-slate-800 hover:text-brand-600">
                Company
              </button>

              {/* CTAs */}
              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setRegistrationModalOpen(true);
                  }}
                >
                  Register
                </Button>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                >
                  Login
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Modals */}
      <LoginModal 
        open={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        role="client" 
      />
      <RegistrationModal 
        open={registrationModalOpen} 
        onClose={() => setRegistrationModalOpen(false)} 
      />
    </header>
  );
}
