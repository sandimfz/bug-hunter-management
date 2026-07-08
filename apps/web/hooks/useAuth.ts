"use client"

import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import type { LoginInput, RegisterInput, UpdateProfileInput, ChangePasswordInput } from "@/lib/schemas/auth"

interface AuthResponse {
  user: { id: number; email: string; name: string; plan: string }
  token: string
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) =>
      api.post<AuthResponse>("/auth/login", data),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterInput) =>
      api.post<AuthResponse>("/auth/register", data),
  })
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      api.put("/auth/profile", data),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      api.put("/auth/password", data),
  })
}
