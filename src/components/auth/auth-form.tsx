'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase-client'

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type AuthFields = z.infer<typeof authSchema>

export default function AuthForm() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: async ({ email, password }: AuthFields) => {
      if (tab === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw new Error(error.message)
        return 'Check your email for the confirmation link!'
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw new Error(error.message)
        return 'Signed in successfully!'
      }
    },
    onSuccess: (msg) => {
      if (tab === 'signin') {
        navigate({ to: '/' })
      } else {
        setMessage(msg)
      }
    },
    onError: () => {
      setMessage('')
    },
  })

  const form = useForm({
    validators: { onChange: authSchema },
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      const response = await mutation.mutateAsync(value)
      console.log(response)
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Perfin</CardTitle>
          <CardDescription>
            Track your expenses and manage your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as 'signin' | 'signup')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
                className="space-y-4"
              >
                <form.Field
                  name="email"
                  children={(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors[0] && (
                        <p className="text-sm text-red-500">
                          {field.state.meta.errors[0].message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <form.Field
                  name="password"
                  children={(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors[0] && (
                        <p className="text-sm text-red-500">
                          {field.state.meta.errors[0].message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
                className="space-y-4"
              >
                <form.Field
                  name="email"
                  children={(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors[0] && (
                        <p className="text-sm text-red-500">
                          {field.state.meta.errors[0].message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <form.Field
                  name="password"
                  children={(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors[0] && (
                        <p className="text-sm text-red-500">
                          {field.state.meta.errors[0].message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {message && (
            <Alert className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
