import * as React from 'react'

export function Footer() {
  return (
    <footer className="bg-[#223448] text-white rounded-t-[52px]">
      <div className="mx-auto max-w-7xl px-2 sm:px-3 lg:px-8 xl:px-12 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>© 2026 UZA Logistics. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
