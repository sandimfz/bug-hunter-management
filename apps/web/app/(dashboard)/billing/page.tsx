import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        Billing
      </p>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-zinc-100">
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-[10px] border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
              Free
            </Badge>
            <p className="text-sm text-zinc-500">
              Upgrade to Pro for unlimited programs and team collaboration.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-zinc-100">
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            No billing history. You are on the Free plan.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
