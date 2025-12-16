'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Check, X, ExternalLink } from 'lucide-react'
import { approvePlasmic Request, rejectPageBuilderRequest } from '@/app/actions/admin-page-builder'
import { useRouter } from 'next/navigation'

interface PageBuilderRequest {
  id: string
  subdomain: string
  full_name: string
  email: string
  page_builder_requested_at: string
  plasmic_project_id: string | null
  plasmic_api_token: string | null
}

export function PageBuilderRequestCard({ request }: { request: PageBuilderRequest }) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [error, setError] = useState('')
  
  const isConfigured = request.plasmic_project_id && request.plasmic_api_token
  const requestDate = new Date(request.page_builder_requested_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  
  const handleApprove = async () => {
    if (!projectId || !apiToken) {
      setError('Please enter both Project ID and API Token')
      return
    }
    
    setIsApproving(true)
    setError('')
    
    const formData = new FormData()
    formData.append('tenantId', request.id)
    formData.append('projectId', projectId)
    formData.append('apiToken', apiToken)
    formData.append('tenantEmail', request.email)
    formData.append('tenantName', request.full_name)
    formData.append('subdomain', request.subdomain)
    
    const result = await approvePlasmi cRequest(formData)
    
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to approve request')
      setIsApproving(false)
    }
  }
  
  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this request?')) return
    
    const result = await rejectPageBuilderRequest(request.id)
    
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to reject request')
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {request.full_name}
              {isConfigured && <Badge variant="default">Configured</Badge>}
              {!isConfigured && <Badge variant="secondary">Pending</Badge>}
            </CardTitle>
            <CardDescription>
              <div className="flex flex-col gap-1">
                <span>
                  <strong>Subdomain:</strong>{' '}
                  <a 
                    href={`https://${request.subdomain}.tektonstable.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {request.subdomain}.tektonstable.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
                <span><strong>Email:</strong> {request.email}</span>
                <span><strong>Requested:</strong> {requestDate}</span>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {!isConfigured && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`project-id-${request.id}`}>Plasmic Project ID</Label>
            <Input
              id={`project-id-${request.id}`}
              placeholder="Enter Project ID from studio.plasmic.app"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`api-token-${request.id}`}>Plasmic API Token</Label>
            <Input
              id={`api-token-${request.id}`}
              type="password"
              placeholder="Enter API Token from Plasmic"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              {isApproving ? 'Approving...' : 'Approve & Configure'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isApproving}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p><strong>Setup Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://studio.plasmic.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">studio.plasmic.app</a></li>
              <li>Create a new project for {request.full_name}</li>
              <li>Copy the Project ID from the URL</li>
              <li>Click "Code" button to get the API Token</li>
              <li>Paste both values above and click "Approve & Configure"</li>
            </ol>
          </div>
        </CardContent>
      )}
      
      {isConfigured && (
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              This tenant has been configured with Plasmic credentials.
            </p>
            <div className="bg-muted p-3 rounded-lg space-y-1">
              <p><strong>Project ID:</strong> {request.plasmic_project_id}</p>
              <p><strong>API Token:</strong> {request.plasmic_api_token?.substring(0, 20)}...</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
