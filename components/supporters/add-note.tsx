'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { addSupporterNote } from '@/app/actions/supporter-crm'

export function AddSupporterNote({ supporterId, tenantId }: { supporterId: string; tenantId: string }) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await addSupporterNote({ supporterId, tenantId, note })
    setNote('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Add a note about this supporter..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading || !note.trim()}>
        {loading ? 'Adding...' : 'Add Note'}
      </Button>
    </form>
  )
}
