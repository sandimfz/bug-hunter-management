"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { useCreateFinding } from "@/hooks/useCreateFinding"
import { createFindingSchema, type CreateFindingInput } from "@/lib/schemas/finding"

interface FindingFormProps {
  assetUuid: string
  onCreated?: () => void
}

export function FindingForm({ assetUuid, onCreated }: FindingFormProps) {
  const createFinding = useCreateFinding()

  const form = useForm<CreateFindingInput>({
    resolver: zodResolver(createFindingSchema),
    defaultValues: { title: "", severity: "medium", poc: "", rewardAmount: "" },
  })

  const onSubmit = async (data: CreateFindingInput) => {
    try {
      await createFinding.mutateAsync({
        ...data,
        assetUuid,
        poc: data.poc || undefined,
        rewardAmount: data.rewardAmount ? Number(data.rewardAmount) : undefined,
      })
      form.reset()
      onCreated?.()
    } catch {}
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-mono">Record Finding</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest">Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. SQL Injection in /api/users" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="severity" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest">Severity</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="poc" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest">Proof of Concept</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Steps to reproduce, curl commands, screenshots..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="rewardAmount" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest">Reward Amount ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={createFinding.isPending} className="font-mono font-bold">
              {createFinding.isPending ? "Saving..." : "Save Finding"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
