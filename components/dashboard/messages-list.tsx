'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, MailOpen, Archive, Trash2, Phone } from 'lucide-react'
import { updateMessageStatus, deleteContactMessage } from '@/app/actions/contact'
import { useRouter } from 'next/navigation'

type Message = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: 'unread' | 'read' | 'archived' | 'spam'
  created_at: string
}

export function MessagesList({ messages }: { messages: Message[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return msg.status !== 'spam'
    return msg.status === filter
  })

  async function handleMarkAsRead(messageId: string) {
    await updateMessageStatus(messageId, 'read')
    router.refresh()
  }

  async function handleMarkAsUnread(messageId: string) {
    await updateMessageStatus(messageId, 'unread')
    router.refresh()
  }

  async function handleArchive(messageId: string) {
    await updateMessageStatus(messageId, 'archived')
    router.refresh()
  }

  async function handleDelete(messageId: string) {
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteContactMessage(messageId)
      router.refresh()
    }
  }

  function toggleExpand(messageId: string, status: string) {
    setExpandedId(expandedId === messageId ? null : messageId)
    if (status === 'unread') {
      handleMarkAsRead(messageId)
    }
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
            <p className="text-muted-foreground">
              Contact form submissions will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({messages.filter(m => m.status !== 'spam').length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({messages.filter(m => m.status === 'unread').length})
        </Button>
        <Button
          variant={filter === 'read' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('read')}
        >
          Read ({messages.filter(m => m.status === 'read').length})
        </Button>
        <Button
          variant={filter === 'archived' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('archived')}
        >
          Archived ({messages.filter(m => m.status === 'archived').length})
        </Button>
      </div>

      <div className="space-y-3">
        {filteredMessages.map((msg) => (
          <Card
            key={msg.id}
            className={`cursor-pointer transition-colors ${
              msg.status === 'unread' ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => toggleExpand(msg.id, msg.status)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {msg.status === 'unread' ? (
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <MailOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <CardTitle className="text-lg truncate">{msg.name}</CardTitle>
                    {msg.status === 'unread' && (
                      <Badge variant="default" className="flex-shrink-0">New</Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2 flex-wrap">
                    <span className="truncate">{msg.email}</span>
                    {msg.phone && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {msg.phone}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </CardDescription>
                </div>
              </div>
              {msg.subject && (
                <p className="text-sm font-medium mt-2">{msg.subject}</p>
              )}
            </CardHeader>

            {expandedId === msg.id && (
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `mailto:${msg.email}`
                    }}
                  >
                    Reply via Email
                  </Button>
                  {msg.status === 'read' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsUnread(msg.id)
                      }}
                    >
                      Mark Unread
                    </Button>
                  )}
                  {msg.status !== 'archived' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArchive(msg.id)
                      }}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(msg.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
