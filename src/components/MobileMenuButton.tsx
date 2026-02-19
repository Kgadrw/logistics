import * as React from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '../lib/cn'

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = React.useState(false)

  // Listen for close event from sidebar
  React.useEffect(() => {
    const handleCloseMenu = () => {
      setIsOpen(false)
    }
    window.addEventListener('closeMobileMenu', handleCloseMenu)
    return () => window.removeEventListener('closeMobileMenu', handleCloseMenu)
  }, [])

  React.useEffect(() => {
    const sidebar = document.getElementById('sidebar')
    if (sidebar) {
      if (isOpen) {
        sidebar.classList.remove('-translate-x-full')
        sidebar.classList.add('translate-x-0')
      } else {
        sidebar.classList.add('-translate-x-full')
        sidebar.classList.remove('translate-x-0')
      }
    }
  }, [isOpen])

  React.useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar')
      const button = document.getElementById('mobile-menu-button')
      const backdrop = document.getElementById('mobile-menu-backdrop')
      if (sidebar && button && isOpen) {
        if (
          !sidebar.contains(e.target as Node) && 
          !button.contains(e.target as Node) &&
          (!backdrop || backdrop.contains(e.target as Node))
        ) {
          setIsOpen(false)
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Hide mobile menu button since sidebar is now always visible as bottom bar on mobile
  return null
}
