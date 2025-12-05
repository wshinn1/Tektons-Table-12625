interface TenantBackupEmailProps {
  tenantName: string
  subdomain: string
  backupId: string
  fileSize: string
  recordCount: number
  completedAt: string
  blobUrl: string
}

export default function TenantBackupEmail({
  tenantName,
  subdomain,
  backupId,
  fileSize,
  recordCount,
  completedAt,
  blobUrl,
}: TenantBackupEmailProps) {
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6", color: "#333" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <h1 style={{ color: "#10b981" }}>✓ Backup Completed Successfully</h1>

          <p>Hello {tenantName},</p>

          <p>Your Tektons Table site backup has been completed successfully.</p>

          <div style={{ background: "#f3f4f6", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
            <h3 style={{ marginTop: "0" }}>Backup Details</h3>
            <table style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "8px 0" }}>
                  <strong>Site:</strong>
                </td>
                <td>{subdomain}.tektonstable.com</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0" }}>
                  <strong>Backup ID:</strong>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{backupId}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0" }}>
                  <strong>Completed:</strong>
                </td>
                <td>{completedAt} EST</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0" }}>
                  <strong>Records:</strong>
                </td>
                <td>{recordCount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0" }}>
                  <strong>File Size:</strong>
                </td>
                <td>{fileSize}</td>
              </tr>
            </table>
          </div>

          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              background: "#dbeafe",
              borderLeft: "4px solid #3b82f6",
              borderRadius: "4px",
            }}
          >
            <p style={{ margin: "0" }}>
              <strong>Your backup is stored securely</strong>
            </p>
            <p style={{ margin: "10px 0 0 0" }}>
              This backup will be retained for 30 days and includes all your posts, supporters, donations, and site
              content.
            </p>
          </div>

          <div style={{ marginTop: "30px" }}>
            <a
              href={blobUrl}
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#3b82f6",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
              }}
            >
              Download Backup
            </a>
          </div>

          <p style={{ marginTop: "30px", fontSize: "14px", color: "#666" }}>
            Automatic backups run nightly at midnight EST. If you have any questions, please contact support.
          </p>

          <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

          <p style={{ fontSize: "12px", color: "#999" }}>
            Tektons Table Automated Backup System
            <br />
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  )
}
