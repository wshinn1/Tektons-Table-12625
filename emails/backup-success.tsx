import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface BackupSuccessEmailProps {
  backupId: string
  fileSize: string
  recordCount: number
  tables: string[]
  completedAt: string
  blobUrl: string
  backupType?: string // Added backupType
}

export default function BackupSuccessEmail({
  backupId,
  fileSize,
  recordCount,
  tables,
  completedAt,
  blobUrl,
  backupType = "platform", // Default to platform
}: BackupSuccessEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Backup completed successfully</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✓ {backupType === "platform" ? "Platform" : "Tenant"} Backup Completed</Heading>

          <Text style={text}>The automated {backupType} backup has completed successfully.</Text>

          <Section style={infoSection}>
            <Text style={label}>Backup ID:</Text>
            <Text style={value}>{backupId}</Text>

            <Text style={label}>File Size:</Text>
            <Text style={value}>{fileSize}</Text>

            <Text style={label}>Total Records:</Text>
            <Text style={value}>{recordCount.toLocaleString()}</Text>

            <Text style={label}>Tables Backed Up:</Text>
            <Text style={value}>{tables.length} tables</Text>
            <Text style={tableList}>{tables.join(", ")}</Text>

            <Text style={label}>Completed At:</Text>
            <Text style={value}>{completedAt} EST</Text>
          </Section>

          <Text style={text}>
            The backup file is stored securely in Vercel Blob storage and will be retained for 30 days.
          </Text>

          <Text style={text}>Next backup scheduled for tomorrow at midnight EST.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const h1 = {
  color: "#16a34a",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  padding: "0 40px",
}

const infoSection = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 40px",
}

const label = {
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "4px",
  marginTop: "16px",
}

const value = {
  color: "#0f172a",
  fontSize: "16px",
  marginTop: "0",
  marginBottom: "0",
}

const tableList = {
  color: "#64748b",
  fontSize: "12px",
  marginTop: "4px",
  lineHeight: "18px",
}
