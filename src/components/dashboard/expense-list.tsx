'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Currency, Expense } from '@/lib/types'
import { supabase } from '@/lib/supabase-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface ExpenseListProps {
  refreshTrigger: number
  selectedCurrency: Currency
}

export default function ExpenseList({
  refreshTrigger,
  selectedCurrency,
}: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Array<Expense>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExpenses()
  }, [refreshTrigger])

  const fetchExpenses = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('expenses')
      .select(
        `
        *,
        categories (
          id,
          name,
          icon,
          color
        )
      `,
      )
      .order('expense_date', { ascending: false })
      .limit(20)

    if (data) setExpenses(data)
    setLoading(false)
  }

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id)

    if (!error) {
      setExpenses(expenses.filter((expense) => expense.id !== id))
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No expenses yet. Add your first expense!
          </p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{
                      backgroundColor: expense.categories?.color || '#3b82f6',
                    }}
                  >
                    {expense.categories?.icon || '💰'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {expense.description ||
                        expense.categories?.name ||
                        'Uncategorized'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    {expense.currency !== selectedCurrency && (
                      <Badge variant="outline" className="text-xs">
                        {expense.currency}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
