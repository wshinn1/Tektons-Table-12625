import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  label: {
    fontSize: 11,
    color: "#6b7280",
  },
  value: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: "bold",
  },
  amountSection: {
    backgroundColor: "#f3f4f6",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2563eb",
  },
  recurringBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  recurringText: {
    fontSize: 10,
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  notice: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
  },
  noticeTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 10,
    color: "#78350f",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 9,
    color: "#9ca3af",
  },
})

interface DonationReceiptProps {
  donorName: string
  donorEmail: string
  amount: number // in cents
  currency: string
  tenantName: string
  tenantSlug: string
  donationDate: string
  transactionId: string
  isRecurring: boolean
}

function DonationReceiptDocument({
  donorName,
  donorEmail,
  amount,
  currency,
  tenantName,
  donationDate,
  transactionId,
  isRecurring,
}: DonationReceiptProps) {
  const formattedAmount = `${currency}${(amount / 100).toFixed(2)}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Donation Receipt</Text>
          <Text style={styles.subtitle}>{tenantName}</Text>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Donation Amount</Text>
          <Text style={styles.amountValue}>{formattedAmount}</Text>
          {isRecurring && (
            <View style={styles.recurringBadge}>
              <Text style={styles.recurringText}>RECURRING DONATION</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donor Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{donorName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{donorEmail}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{donationDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>{transactionId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>Credit/Debit Card</Text>
          </View>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Tax Deductibility Notice</Text>
          <Text style={styles.noticeText}>
            This receipt is provided for your records. Please consult with your tax advisor regarding the deductibility
            of your contribution. No goods or services were provided in exchange for this donation.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your generous support of {tenantName}. Your contribution makes a difference.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateDonationReceiptPdf(props: DonationReceiptProps): Promise<Buffer> {
  const buffer = await renderToBuffer(<DonationReceiptDocument {...props} />)
  return Buffer.from(buffer)
}
