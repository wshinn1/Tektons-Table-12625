-- Function to upsert campaign donation digest
CREATE OR REPLACE FUNCTION upsert_campaign_donation_digest(
  p_tenant_id UUID,
  p_amount NUMERIC
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO campaign_donation_digest (tenant_id, notification_date, donation_count, total_amount)
  VALUES (p_tenant_id, CURRENT_DATE, 1, p_amount)
  ON CONFLICT (tenant_id, notification_date)
  DO UPDATE SET
    donation_count = campaign_donation_digest.donation_count + 1,
    total_amount = campaign_donation_digest.total_amount + p_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION upsert_campaign_donation_digest IS 'Tracks campaign donations for daily digest emails';
