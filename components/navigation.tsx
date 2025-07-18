'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Activity, AlertCircle, BarChart3, Settings, Sparkles } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Analytics', href: '/dashboard/ai', icon: Sparkles },
  { name: 'IoT Telemetry', href: '/dashboard/iot', icon: Activity },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Alerts', href: '/dashboard/alerts', icon: AlertCircle },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-6 border-b">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors
              ${isActive 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}