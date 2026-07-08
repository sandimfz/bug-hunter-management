"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { useNotificationSettings, useAddNotificationSetting, useDeleteNotificationSetting } from "@/hooks/useNotifications"
import { addNotificationSchema, type AddNotificationInput } from "@/lib/schemas/notification"

export function NotificationSettings() {
  const { data: settings = [] } = useNotificationSettings()
  const addSetting = useAddNotificationSetting()
  const deleteSetting = useDeleteNotificationSetting()

  const form = useForm<AddNotificationInput>({
    resolver: zodResolver(addNotificationSchema),
    defaultValues: { channel: "discord", webhookUrl: "" },
  })

  const channel = form.watch("channel")
  const placeholder = channel === "email" ? "you@example.com" : channel === "slack" ? "https://hooks.slack.com/services/..." : "https://discord.com/api/webhooks/..."

  const onSubmit = async (data: AddNotificationInput) => {
    try {
      await addSetting.mutateAsync(data)
      form.reset({ channel: data.channel, webhookUrl: "" })
    } catch {}
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-mono">Notifications</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Get notified when new assets are discovered or findings are recorded.</p>
        {settings.length > 0 && (
          <div className="space-y-2">
            {settings.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px]">{s.channel}</Badge>
                  <span className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">{s.webhookUrl}</span>
                </div>
                <Button variant="ghost" size="xs" onClick={() => deleteSetting.mutate(s.id)} className="text-destructive">Remove</Button>
              </div>
            ))}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex items-end gap-3">
              <FormField control={form.control} name="channel" render={({ field }) => (
                <FormItem className="w-36">
                  <FormLabel className="text-xs uppercase tracking-widest">Channel</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="webhookUrl" render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-xs uppercase tracking-widest">{channel === "email" ? "Email Address" : "Webhook URL"}</FormLabel>
                  <FormControl>
                    <Input type={channel === "email" ? "email" : "url"} placeholder={placeholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={addSetting.isPending} className="font-mono font-bold">{addSetting.isPending ? "Adding..." : "Add"}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
