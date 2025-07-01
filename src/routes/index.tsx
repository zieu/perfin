import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { UserResponse } from '@supabase/supabase-js'
import type { Currency } from '@/lib/utils'
import CategoryManager from '@/components/dashboard/category-manager'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import StatsOverview from '@/components/dashboard/stats-overview'
import ExpenseList from '@/components/dashboard/expense-list'
import ExpenseForm from '@/components/dashboard/expense-form'
import { useUser } from '@/hooks/use-user'
import { Loader } from '@/components/ui/loader'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

  const userQuery = useUser()

  useEffect(() => {
    // Load saved currency preference
    const savedCurrency = localStorage.getItem('selectedCurrency')
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency as Currency)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      navigate({ to: '/auth' })
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleExpenseAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency)
    localStorage.setItem('selectedCurrency', currency)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <h1 className="text-xl font-semibold">Perfin</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {userQuery.data?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                {isLoggingOut ? <Loader /> : <LogOut className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <StatsOverview
            refreshTrigger={refreshTrigger}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
          />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ExpenseForm
                onExpenseAdded={handleExpenseAdded}
                defaultCurrency={selectedCurrency}
              />
              <ExpenseList
                refreshTrigger={refreshTrigger}
                selectedCurrency={selectedCurrency}
              />
            </div>
            <div>
              <CategoryManager />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
