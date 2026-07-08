"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, LogOut, User } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { useSearch } from "@/hooks/useSearch"
import Link from "next/link"

export function Topbar() {
  const router = useRouter()
  const { data: session } = useSession()
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const userName = session?.user?.name ?? ""

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: results } = useSearch(debouncedQuery)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = () => { signOut({ callbackUrl: "/login" }) }

  const hasResults = results && (results.programs.length > 0 || results.assets.length > 0 || results.findings.length > 0)

  return (
    <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur z-10">
      <div className="flex items-center gap-4">
        <div className="relative" ref={wrapperRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => results && setOpen(true)} placeholder="Search programs, assets, findings..." className="h-9 w-64 pl-10" />
          {open && results && (
            <div className="absolute top-full left-0 mt-1 w-96 max-h-80 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
              {!hasResults ? (
                <p className="px-4 py-3 text-xs text-muted-foreground">No results found</p>
              ) : (
                <div className="py-1">
                  {results.programs.length > 0 && (
                    <div>
                      <p className="px-4 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">Programs</p>
                      {results.programs.map((p) => (
                        <Link key={p.uuid} href={`/programs/${p.uuid}`} onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-accent transition-colors">
                          <span className="text-sm text-foreground font-mono">{p.name}</span>
                          <span className="ml-2 text-[10px] text-muted-foreground uppercase">{p.platform}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {results.assets.length > 0 && (
                    <div>
                      <p className="px-4 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground border-t border-border">Assets</p>
                      {results.assets.map((a) => (
                        <Link key={a.uuid} href={`/programs/${a.programUuid}/assets/${a.uuid}`} onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-accent transition-colors">
                          <span className="text-sm text-foreground font-mono">{a.value}</span>
                          <span className="ml-2 text-[10px] text-muted-foreground">{a.type}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {results.findings.length > 0 && (
                    <div>
                      <p className="px-4 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground border-t border-border">Findings</p>
                      {results.findings.map((f) => (
                        <Link key={f.uuid} href="/findings" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-accent transition-colors">
                          <span className="text-sm text-foreground font-mono">{f.title}</span>
                          <span className="ml-2 text-[10px] text-muted-foreground">{f.severity}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/programs/new"><Button className="font-mono font-bold">+ New Program</Button></Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-mono text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer">
            <User className="size-4" />
            <span className="text-xs">{userName || "User"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
            <DropdownMenuItem onClick={() => router.push("/settings")}><User className="size-4 mr-2" />Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="size-4 mr-2" />Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
