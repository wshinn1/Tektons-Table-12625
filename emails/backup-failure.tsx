import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface BackupFailureEmailProps {
  errorMessage: string
  startedAt: string
  lastSuccessfulBackup?: {
    completedAt: string
    recordCount: number
  }
}

export default function BackupFailureEmail({
  errorMessage,
  startedAt,
  lastSuccessfulBackup,
}: BackupFailureEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Backup failed - Action Required</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Backup Failed</Heading>
          
          <Text style={text}>
            The automated database backup has failed and requires your attention.
          </Text>

          <Section style={errorSection}>
            <Text style={label}>Error Message:</Text>
            <Text style={errorText}>{errorMessage}</Text>

            <Text style={label}>Started At:</Text>
            <Text style={value}>{startedAt}</Text>
          </Section>

          {lastSuccessfulBackup && (
            <Section style={infoSection}>
              <Text style={label}>Last Successful Backup:</Text>
              <Text style={value}>{lastSuccessfulBackup.completedAt}</Text>
              <Text style={value}>
                {lastSuccessfulBackup.recordCount.toLocaleString()} records
              </Text>
            </Section>
          )}

          <Text style={text}>
            Please check the admin dashboard and investigate the error as soon as possible.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#dc2626',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 40px',
}

const errorSection = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  borderLeft: '4px solid #dc2626',
  padding: '24px',
  margin: '24px 40px',
}

const infoSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
}

const label = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '4px',
  marginTop: '16px',
}

const value = {
  color: '#0f172a',
  fontSize: '16px',
  marginTop: '0',
  marginBottom: '0',
}

const errorText = {
  color: '#dc2626',
  fontSize: '14px',
  marginTop: '0',
  fontFamily: 'monospace',
  backgroundColor: '#ffffff',
  padding: '12px',
  borderRadius: '4px',
}
