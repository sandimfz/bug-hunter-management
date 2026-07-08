"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { useUpdateProfile, useChangePassword } from "@/hooks/useAuth"
import { updateProfileSchema, changePasswordSchema, type UpdateProfileInput, type ChangePasswordInput } from "@/lib/schemas/auth"
import { NotificationSettings } from "@/components/dashboard/notification-settings"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [message, setMessage] = useState<string | null>(null)
  const [pwMessage, setPwMessage] = useState<string | null>(null)

  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "" },
  })

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  })

  useEffect(() => {
    if (session?.user) {
      profileForm.reset({ name: session.user.name ?? "" })
    }
  }, [session, profileForm])

  const handleSaveProfile = async (data: UpdateProfileInput) => {
    setMessage(null)
    try {
      await updateProfile.mutateAsync(data)
      setMessage("Profile updated successfully")
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to update profile")
    }
  }

  const handleChangePassword = async (data: ChangePasswordInput) => {
    setPwMessage(null)
    try {
      await changePassword.mutateAsync(data)
      setPwMessage("Password changed successfully")
      passwordForm.reset()
    } catch (err: unknown) {
      setPwMessage(err instanceof Error ? err.message : "Failed to change password")
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Settings</p>

      <Card>
        <CardHeader><CardTitle className="text-sm font-mono">Account Settings</CardTitle></CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="space-y-4">
              <FormField control={profileForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest font-medium">Email</p>
                <Input value={session?.user?.email ?? ""} disabled />
                <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
              </div>
              {message && <p className={`text-xs ${message.includes("success") ? "text-emerald-400" : "text-destructive"}`}>{message}</p>}
              <Button type="submit" disabled={updateProfile.isPending} className="font-mono font-bold">
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-mono">Change Password</CardTitle></CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {pwMessage && <p className={`text-xs ${pwMessage.includes("success") ? "text-emerald-400" : "text-destructive"}`}>{pwMessage}</p>}
              <Button type="submit" disabled={changePassword.isPending} className="font-mono font-bold">
                {changePassword.isPending ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-mono">API Keys</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Manage your API keys for recon integrations.</p>
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-widest font-medium">Chaos API Key</p>
            <Input type="password" placeholder="pk-..." />
          </div>
        </CardContent>
      </Card>

      <NotificationSettings />

      <Card>
        <CardHeader><CardTitle className="text-sm font-mono">Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
          <Button variant="destructive" className="mt-4 font-mono font-bold">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  )
}
