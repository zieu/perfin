'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type React from 'react'

import type { Category } from '@/lib/types'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/hooks/use-user'

const EMOJI_OPTIONS = [
  '💰',
  '🍽️',
  '🚗',
  '🛍️',
  '🎬',
  '💡',
  '🏥',
  '✈️',
  '🏠',
  '📱',
  '⛽',
  '🎓',
]
const COLOR_OPTIONS = [
  '#ef4444',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#6b7280',
  '#f97316',
]

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  return data as Array<Category>
}

export default function CategoryManager() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    icon: '💰',
    color: '#3b82f6',
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const userQuery = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('categories').insert({
      name: formData.name,
      icon: formData.icon,
      color: formData.color,
      user_id: userQuery.data?.id,
    })

    if (!error) {
      setFormData({ name: '', icon: '💰', color: '#3b82f6' })
      setOpen(false)
      refetch()
    }

    setLoading(false)
  }

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (!error) {
      refetch()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categories</CardTitle>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Button
                      key={emoji}
                      type="button"
                      variant={formData.icon === emoji ? 'default' : 'outline'}
                      className="h-10 w-10 p-0"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      className="h-10 w-10 p-0 border-2"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          formData.color === color ? '#000' : 'transparent',
                      }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3">
          {data?.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCategory(category.id)}
                className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
