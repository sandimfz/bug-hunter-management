"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { useSession } from "next-auth/react"
import { useCreateProgram } from "@/hooks/useCreateProgram"
import { useWorkspace, useCreateWorkspace } from "@/hooks/useWorkspace"
import { createProgramSchema, type CreateProgramInput } from "@/lib/schemas/program"

export default function NewProgramPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const { data: workspaces = [], isLoading: loadingWorkspace } = useWorkspace()
  const createWorkspace = useCreateWorkspace()
  const createProgram = useCreateProgram()

  const workspaceUuid = workspaces[0]?.uuid ?? null

  const form = useForm<CreateProgramInput>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: { name: "", platform: "hackerone", scopeNotes: "" },
  })

  const onSubmit = async (data: CreateProgramInput) => {
    let wsUuid = workspaceUuid
    if (!wsUuid) {
      const userName = session?.user?.name ?? "User"
      const ws = await createWorkspace.mutateAsync({
        name: `${userName}'s Workspace`,
      })
      wsUuid = ws.uuid
    }
    if (!wsUuid) return

    const program = await createProgram.mutateAsync({
      ...data,
      workspaceUuid: wsUuid,
      scopeNotes: data.scopeNotes || undefined,
    })
    router.push(`/programs/${program.uuid}`)
  }

  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">New Program</p>
      <Card>
        <CardHeader><CardTitle className="text-sm font-mono">Create Program</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Program Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HackerOne - Example Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="platform" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Platform</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hackerone">HackerOne</SelectItem>
                      <SelectItem value="bugcrowd">Bugcrowd</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="scopeNotes" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Scope Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="In-scope and out-of-scope targets..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {loadingWorkspace && <p className="text-xs text-muted-foreground font-mono">Loading workspace...</p>}
              <Button type="submit" disabled={createProgram.isPending} className="font-mono font-bold">
                {createProgram.isPending ? "Creating..." : "Create Program"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
