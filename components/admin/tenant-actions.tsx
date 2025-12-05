'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateTenantStatus, deleteTenant } from '@/app/actions/admin'
import { MoreVertical } from 'lucide-react'

interface TenantActionsProps {
  tenantId: string
  isActive: boolean
}

export function TenantActions({ tenantId, isActive }: TenantActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleToggleStatus = async () => {
    if (loading) return
    setLoading(true)
    try {
      await updateTenantStatus(tenantId, !isActive)
    } catch (error) {
      console.error('Failed to update tenant status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return
    }
    
    setLoading(true)
    try {
      await deleteTenant(tenantId)
    } catch (error) {
      console.error('Failed to delete tenant:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggleStatus}>
          {isActive ? 'Suspend Account' : 'Activate Account'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          Delete Tenant
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
