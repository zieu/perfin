export interface Category {
  id: string
  name: string
  icon: string
  color: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  amount: number
  currency: 'USD' | 'UZS'
  description: string | null
  category_id: string | null
  user_id: string
  expense_date: string
  created_at: string
  updated_at: string
  categories?: Category
}

export interface User {
  id: string
  email: string
  created_at: string
}

export type Currency = 'USD' | 'UZS'
