"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import {
  LayoutDashboard,
  Target,
  FileText,
  Globe,
  DollarSign,
  Settings,
  CreditCard,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/programs", label: "Programs", icon: Target },
  { href: "/findings", label: "Findings", icon: FileText },
  { href: "/endpoints", label: "Endpoints", icon: Globe },
  { href: "/bounty", label: "Bounty", icon: DollarSign },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 border-r border-zinc-800 bg-zinc-900 md:block">
      <div className="flex h-14 items-center border-b border-zinc-800 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-mono font-bold text-emerald-400">
            🐛 SandiMF
          </span>
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-mono transition-colors",
                isActive
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
