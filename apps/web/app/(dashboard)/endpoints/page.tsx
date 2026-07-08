"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { AssetTable } from "@/components/dashboard/asset-table"
import { useAssets } from "@/hooks/useAssets"
import { usePrograms } from "@/hooks/usePrograms"
import { useTriggerScan } from "@/hooks/useRecon"

export default function EndpointsPage() {
  const { assets, loading, error, refetch } = useAssets()
  const { programs } = usePrograms()
  const triggerScan = useTriggerScan()
  const [domain, setDomain] = useState("")
  const [selectedProgram, setSelectedProgram] = useState<string>("")
  const [scanResult, setScanResult] = useState<string | null>(null)

  const handleScan = async () => {
    if (!domain.trim() || !selectedProgram) return
    setScanResult(null)
    try {
      const res = await triggerScan.mutateAsync({ programId: Number(selectedProgram), domain: domain.trim() })
      setScanResult(`Discovered ${res.imported} new subdomains`)
      refetch()
    } catch (err: unknown) {
      setScanResult(err instanceof Error ? err.message : "Scan failed")
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Endpoint Map</p>

      <Card>
        <CardHeader><CardTitle className="text-sm font-mono">Recon Scan</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label className="text-xs uppercase tracking-widest">Domain</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
            </div>
            <div className="min-w-[200px] space-y-2">
              <Label className="text-xs uppercase tracking-widest">Program</Label>
              <Select value={selectedProgram} onValueChange={(v) => setSelectedProgram(v ?? "")}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select program..." /></SelectTrigger>
                <SelectContent>
                  {programs.map((p) => <SelectItem key={p.uuid} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleScan} disabled={triggerScan.isPending || !domain.trim() || !selectedProgram} className="font-mono font-bold">
              {triggerScan.isPending ? "Scanning..." : "Run Recon"}
            </Button>
          </div>
          {scanResult && <p className="text-xs text-emerald-400 mt-3 font-mono">{scanResult}</p>}
          <p className="text-[10px] text-muted-foreground mt-2">Uses crt.sh by default. Set CHAOS_API_KEY in .env for ProjectDiscovery Chaos API.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-mono">All Discovered Assets</CardTitle></CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive mb-4">Error: {error}</p>}
          {loading ? <p className="text-sm text-muted-foreground font-mono">Loading assets...</p> : <AssetTable assets={assets} />}
        </CardContent>
      </Card>
    </div>
  )
}
