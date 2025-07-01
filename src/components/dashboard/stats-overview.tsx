'use client'

import { useEffect, useState } from 'react'
import { Calendar, DollarSign, TrendingDown, TrendingUp } from 'lucide-react'
import type { Currency } from '@/lib/types'
import { supabase } from '@/lib/supabase-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CURRENCIES, convertCurrency, formatCurrency } from '@/lib/utils'

interface StatsOverviewProps {
  refreshTrigger: number
  selectedCurrency: Currency
  onCurrencyChange: (currency: Currency) => void
}

interface Stats {
  totalThisMonth: number
  totalLastMonth: number
  totalExpenses: number
  avgDaily: number
}

export default function StatsOverview({
  refreshTrigger,
  selectedCurrency,
  onCurrencyChange,
}: StatsOverviewProps) {
  const [stats, setStats] = useState<Stats>({
    totalThisMonth: 0,
    totalLastMonth: 0,
    totalExpenses: 0,
    avgDaily: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger, selectedCurrency])

  const fetchStats = async () => {
    setLoading(true)

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get all expenses
    const { data: allExpenses } = await supabase
      .from('expenses')
      .select('amount, currency, expense_date')

    if (allExpenses) {
      let totalThisMonth = 0
      let totalLastMonth = 0
      let totalExpenses = 0

      allExpenses.forEach((expense) => {
        const expenseDate = new Date(expense.expense_date)
        const convertedAmount = convertCurrency(
          expense.amount,
          expense.currency as Currency,
          selectedCurrency,
        )

        totalExpenses += convertedAmount

        if (expenseDate >= thisMonth) {
          totalThisMonth += convertedAmount
        } else if (expenseDate >= lastMonth && expenseDate <= endLastMonth) {
          totalLastMonth += convertedAmount
        }
      })

      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate()
      const avgDaily = totalThisMonth / now.getDate()

      setStats({
        totalThisMonth,
        totalLastMonth,
        totalExpenses,
        avgDaily,
      })
    }

    setLoading(false)
  }

  const monthlyChange =
    stats.totalLastMonth > 0
      ? ((stats.totalThisMonth - stats.totalLastMonth) / stats.totalLastMonth) *
        100
      : 0

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Overview</h2>
        <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
              <SelectItem key={code} value={code}>
                {symbol} {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalThisMonth, selectedCurrency)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {monthlyChange > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                  <span className="text-red-500">
                    +{monthlyChange.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500">
                    {monthlyChange.toFixed(1)}%
                  </span>
                </>
              )}{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalLastMonth, selectedCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Previous month total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.avgDaily, selectedCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's daily average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalExpenses, selectedCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">All time total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
