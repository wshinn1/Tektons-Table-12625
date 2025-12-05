-- Chat Analytics System
-- Track chatbot conversations and identify common questions

-- Create chat_logs table to track all chatbot interactions
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_question TEXT NOT NULL,
  bot_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  helpful_rating INTEGER CHECK (helpful_rating IN (1, -1)), -- 1 = helpful, -1 = not helpful
  converted_to_article BOOLEAN DEFAULT FALSE,
  help_article_id UUID REFERENCES help_articles(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_logs_tenant ON chat_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON chat_logs(session_id);

-- Create a view for common questions
CREATE OR REPLACE VIEW common_questions AS
SELECT 
  LOWER(TRIM(user_question)) as question_normalized,
  user_question as example_question,
  COUNT(*) as frequency,
  AVG(CASE WHEN helpful_rating = 1 THEN 1.0 ELSE 0.0 END) as satisfaction_rate,
  MAX(created_at) as last_asked,
  BOOL_OR(converted_to_article) as has_article
FROM chat_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY question_normalized, user_question
HAVING COUNT(*) > 1
ORDER BY frequency DESC, last_asked DESC;

-- Enable RLS
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own chat logs
CREATE POLICY chat_logs_insert_policy ON chat_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can view their own chat logs
CREATE POLICY chat_logs_select_policy ON chat_logs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fixed to use super_admins table instead of non-existent user_roles
-- Policy: Super admins can view all logs
CREATE POLICY chat_logs_admin_select_policy ON chat_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Policy: Super admins can update logs (mark as converted to article)
CREATE POLICY chat_logs_admin_update_policy ON chat_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Function to extract keywords from questions for better matching
CREATE OR REPLACE FUNCTION extract_question_keywords(question TEXT)
RETURNS TEXT[] AS $$
BEGIN
  RETURN string_to_array(
    regexp_replace(
      LOWER(question),
      '[^a-z0-9\s]',
      '',
      'g'
    ),
    ' '
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
