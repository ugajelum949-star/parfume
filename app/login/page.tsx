'use client'

export const dynamic = 'force-dynamic'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Store } from 'lucide-react'
import { useStoreSettings } from '@/components/providers/StoreProvider'
import { getImageSrc } from '@/lib/image-proxy'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, { error: '' })
  const { storeName, storeLogo } = useStoreSettings()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />

      <Card className="w-full max-w-md bg-card border-border relative">
        <CardHeader className="text-center space-y-2">
          {storeLogo ? (
            <img src={getImageSrc(storeLogo)} alt={storeName} className="w-16 h-16 rounded-xl mx-auto object-contain" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center mx-auto">
              <Store className="w-8 h-8 text-gold" />
            </div>
          )}
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to {storeName || 'your store'} admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                className="bg-input border-border focus:border-gold focus:ring-gold/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-input border-border focus:border-gold focus:ring-gold/20"
              />
            </div>

            {state?.error && (
              <div className="text-destructive text-sm text-center font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
