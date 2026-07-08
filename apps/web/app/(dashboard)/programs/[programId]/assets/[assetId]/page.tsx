"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { FindingForm } from "@/components/dashboard/finding-form"
import { useAsset, useUpdateAsset } from "@/hooks/useAsset"
import { useFindings } from "@/hooks/useFindings"
import Link from "next/link"

const statusColors: Record<string, string> = {
  active: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  dead: "border border-red-500/30 bg-red-500/15 text-red-400",
  unchecked: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  flagged: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
}

const methodColors: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-blue-400",
  PUT: "text-yellow-400",
  DELETE: "text-red-400",
  PATCH: "text-orange-400",
}

const severityColors: Record<string, string> = {
  critical: "border border-red-500/30 bg-red-500/15 text-red-400",
  high: "border border-orange-500/30 bg-orange-500/15 text-orange-400",
  medium: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  low: "border border-blue-500/30 bg-blue-500/15 text-blue-400",
  info: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
}

const findingStatusColors: Record<string, string> = {
  draft: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  submitted: "border border-blue-500/30 bg-blue-500/15 text-blue-400",
  triaged: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  accepted: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  rejected: "border border-red-500/30 bg-red-500/15 text-red-400",
  paid: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
}

function statusColor(code: number | null) {
  if (!code) return "text-zinc-400"
  if (code < 300) return "text-emerald-400"
  if (code < 400) return "text-blue-400"
  if (code < 500) return "text-yellow-400"
  return "text-red-400"
}

function HeadersDisplay({ headers }: { headers: Record<string, string> | null }) {
  if (!headers || Object.keys(headers).length === 0) {
    return <p className="text-xs text-zinc-500 font-mono">No headers</p>
  }
  return (
    <div className="space-y-1">
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} className="flex gap-2 font-mono text-xs">
          <span className="text-emerald-400 shrink-0">{key}:</span>
          <span className="text-zinc-300 break-all">{value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AssetDetailPage() {
  const params = useParams<{ programId: string; assetId: string }>()
  const { programId, assetId } = params

  const { data: asset, isLoading } = useAsset(assetId)
  const updateAsset = useUpdateAsset(assetId)
  const { findings, refetch: refetchFindings } = useFindings(undefined, 0, 50, assetId)

  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState("")
  const [showFindingForm, setShowFindingForm] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState(false)
  const [endpointForm, setEndpointForm] = useState({
    method: "", requestHeaders: "", requestBody: "",
    responseStatus: "", responseHeaders: "", responseBody: "", contentType: "",
  })

  if (isLoading) {
    return <div className="space-y-6"><p className="text-sm text-muted-foreground font-mono">Loading asset...</p></div>
  }

  if (!asset) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-destructive">Asset not found</p>
        <Link href={`/programs/${programId}/assets`} className="text-sm text-emerald-400 hover:underline">← Back to Assets</Link>
      </div>
    )
  }

  const isEndpoint = asset.type === "endpoint" || asset.type === "api"

  const handleSaveNotes = async () => {
    await updateAsset.mutateAsync({ notes })
    setEditingNotes(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    await updateAsset.mutateAsync({ status: newStatus })
  }

  const handleSaveEndpoint = async () => {
    const parseHeaders = (s: string): Record<string, string> | undefined => {
      if (!s.trim()) return undefined
      try { return JSON.parse(s) } catch { return undefined }
    }
    await updateAsset.mutateAsync({
      method: endpointForm.method || undefined,
      requestHeaders: parseHeaders(endpointForm.requestHeaders),
      requestBody: endpointForm.requestBody || undefined,
      responseStatus: endpointForm.responseStatus ? Number(endpointForm.responseStatus) : undefined,
      responseHeaders: parseHeaders(endpointForm.responseHeaders),
      responseBody: endpointForm.responseBody || undefined,
      contentType: endpointForm.contentType || undefined,
    })
    setEditingEndpoint(false)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/programs" className="hover:text-foreground">Programs</Link>
        <span>/</span>
        <Link href={`/programs/${programId}`} className="hover:text-foreground">#{programId.slice(0, 8)}</Link>
        <span>/</span>
        <Link href={`/programs/${programId}/assets`} className="hover:text-foreground">Assets</Link>
        <span>/</span>
        <span className="text-foreground font-mono">{asset.value}</span>
      </div>

      {/* Asset header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">
            {asset.method && <span className={`mr-2 ${methodColors[asset.method] ?? ""}`}>{asset.method}</span>}
            {asset.value}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground uppercase">{asset.type}</span>
            <Badge variant="outline" className={`text-[10px] ${statusColors[asset.status] ?? ""}`}>{asset.status}</Badge>
            {asset.responseStatus && <span className={`text-xs font-mono ${statusColor(asset.responseStatus)}`}>{asset.responseStatus}</span>}
            {asset.contentType && <span className="text-[10px] text-muted-foreground font-mono">{asset.contentType}</span>}
          </div>
        </div>
        <Button onClick={() => setShowFindingForm(!showFindingForm)} className="font-mono font-bold">
          {showFindingForm ? "Close" : "+ Record Finding"}
        </Button>
      </div>

      {/* Status quick-change */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Status</p>
          <div className="flex gap-2">
            {(["active", "unchecked", "flagged", "dead"] as const).map((s) => (
              <Button key={s} variant={asset.status === s ? "default" : "outline"} size="xs"
                onClick={() => handleStatusChange(s)} disabled={updateAsset.isPending || asset.status === s} className="font-mono">
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Details */}
      {isEndpoint && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono">Endpoint Details</CardTitle>
              {!editingEndpoint && (
                <Button variant="ghost" size="xs" onClick={() => {
                  setEditingEndpoint(true)
                  setEndpointForm({
                    method: asset.method ?? "",
                    requestHeaders: asset.requestHeaders ? JSON.stringify(asset.requestHeaders, null, 2) : "",
                    requestBody: asset.requestBody ?? "",
                    responseStatus: asset.responseStatus?.toString() ?? "",
                    responseHeaders: asset.responseHeaders ? JSON.stringify(asset.responseHeaders, null, 2) : "",
                    responseBody: asset.responseBody ?? "",
                    contentType: asset.contentType ?? "",
                  })
                }} className="text-emerald-400">Edit</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingEndpoint ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest">HTTP Method</Label>
                    <Input value={endpointForm.method} onChange={(e) => setEndpointForm({ ...endpointForm, method: e.target.value.toUpperCase() })} placeholder="GET, POST, PUT, DELETE, PATCH" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest">Response Status</Label>
                    <Input type="number" value={endpointForm.responseStatus} onChange={(e) => setEndpointForm({ ...endpointForm, responseStatus: e.target.value })} placeholder="200, 404, 500..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Content Type</Label>
                  <Input value={endpointForm.contentType} onChange={(e) => setEndpointForm({ ...endpointForm, contentType: e.target.value })} placeholder="application/json" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Request Headers (JSON)</Label>
                  <Textarea value={endpointForm.requestHeaders} onChange={(e) => setEndpointForm({ ...endpointForm, requestHeaders: e.target.value })} rows={4} className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Request Body</Label>
                  <Textarea value={endpointForm.requestBody} onChange={(e) => setEndpointForm({ ...endpointForm, requestBody: e.target.value })} rows={4} className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Response Headers (JSON)</Label>
                  <Textarea value={endpointForm.responseHeaders} onChange={(e) => setEndpointForm({ ...endpointForm, responseHeaders: e.target.value })} rows={4} className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Response Body</Label>
                  <Textarea value={endpointForm.responseBody} onChange={(e) => setEndpointForm({ ...endpointForm, responseBody: e.target.value })} rows={6} className="font-mono text-xs" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveEndpoint} disabled={updateAsset.isPending} className="font-mono font-bold">
                    {updateAsset.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingEndpoint(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {asset.method && <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Method</p><p className={`text-sm font-mono font-bold ${methodColors[asset.method] ?? ""}`}>{asset.method}</p></div>}
                  {asset.responseStatus && <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Status</p><p className={`text-sm font-mono font-bold ${statusColor(asset.responseStatus)}`}>{asset.responseStatus}</p></div>}
                  {asset.contentType && <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Content-Type</p><p className="text-sm font-mono text-zinc-300">{asset.contentType}</p></div>}
                </div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Request Headers</p><div className="rounded-md border border-border bg-muted/30 p-3"><HeadersDisplay headers={asset.requestHeaders} /></div></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Request Body</p><div className="rounded-md border border-border bg-muted/30 p-3"><pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all">{asset.requestBody || <span className="text-zinc-500">No body</span>}</pre></div></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Response Headers</p><div className="rounded-md border border-border bg-muted/30 p-3"><HeadersDisplay headers={asset.responseHeaders} /></div></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Response Body</p><div className="rounded-md border border-border bg-muted/30 p-3 max-h-64 overflow-y-auto"><pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all">{asset.responseBody || <span className="text-zinc-500">No body</span>}</pre></div></div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono">Notes</CardTitle>
            {!editingNotes && <Button variant="ghost" size="xs" onClick={() => { setEditingNotes(true); setNotes(asset.notes ?? "") }} className="text-emerald-400">Edit</Button>}
          </div>
        </CardHeader>
        <CardContent>
          {editingNotes ? (
            <div className="space-y-3">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} placeholder="Investigation notes..." />
              <div className="flex gap-2">
                <Button onClick={handleSaveNotes} disabled={updateAsset.isPending} className="font-mono font-bold">{updateAsset.isPending ? "Saving..." : "Save"}</Button>
                <Button variant="outline" onClick={() => setEditingNotes(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{asset.notes || "No notes yet. Click Edit to add investigation notes."}</p>
          )}
        </CardContent>
      </Card>

      {/* Finding form */}
      {showFindingForm && <FindingForm assetUuid={assetId} onCreated={() => { refetchFindings(); setShowFindingForm(false) }} />}

      {/* Findings */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-mono">Findings ({findings.length})</CardTitle></CardHeader>
        <CardContent>
          {findings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No findings for this asset yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Title</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Severity</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Status</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map((f) => (
                    <tr key={f.uuid} className="border-b border-border hover:bg-muted/40">
                      <td className="py-3 px-4 text-sm text-foreground font-mono">{f.title}</td>
                      <td className="py-3 px-4"><Badge variant="outline" className={`text-[10px] ${severityColors[f.severity] ?? ""}`}>{f.severity}</Badge></td>
                      <td className="py-3 px-4"><Badge variant="outline" className={`text-[10px] ${findingStatusColors[f.status] ?? ""}`}>{f.status}</Badge></td>
                      <td className="py-3 px-4 text-sm text-emerald-400 font-mono">${f.rewardAmount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
