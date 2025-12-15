# Content Moderation & Compliance Scanning System

## Executive Summary

An automated system to scan tenant sites for Terms of Service violations, inappropriate content, and policy compliance. This ensures Tekton's Table maintains platform integrity while protecting missionaries and donors.

---

## System Overview

### Core Capabilities

1. **Automated Content Scanning**
   - Real-time scanning on content creation/update
   - Scheduled full-site audits (daily/weekly)
   - Image and text analysis using AI

2. **Violation Detection**
   - Inappropriate or offensive content
   - Copyright infringement indicators
   - Prohibited products/services
   - Hate speech or discriminatory language
   - Spam, phishing, or malicious links
   - Missionary-specific policy violations

3. **Progressive Enforcement**
   - Automated warnings for minor violations
   - Content flagging for manual review
   - Temporary suspension for serious violations
   - Permanent bans for severe or repeat offenses
   - Appeal process for disputed violations

4. **Admin Dashboard**
   - Queue of flagged content for review
   - Violation history and patterns
   - Enforcement action management
   - Appeal handling workflow

---

## Detection Methods

### 1. AI-Powered Analysis

**Text Content Moderation**
- **OpenAI Moderation API** - Free tier available
  - Categories: hate, harassment, self-harm, sexual, violence, illegal activities
  - Confidence scores for each category
  - Near-instant analysis (<500ms)

**Image Content Moderation**
- **fal.ai Image Classification** (already integrated)
  - Detect NSFW content
  - Identify violent or disturbing imagery
  - Flag copyright-protected brand logos
  
- **Alternative: AWS Rekognition or Google Cloud Vision**
  - More comprehensive but requires separate integration
  - Better for detailed object/scene detection

### 2. Rule-Based Detection

**Keyword Blacklists**
- Prohibited terms database
- Context-aware matching (reduce false positives)
- Multi-language support

**Pattern Matching**
- URL blacklists (known scam/phishing domains)
- Email/phone harvesting patterns
- Suspicious link structures
- Excessive external links (spam indicator)

**Content Analysis**
- Duplicate content detection (plagiarism)
- Excessive capitalization or exclamation marks
- Ratio of promotional vs. informational content
- Request for off-platform payments

### 3. Behavioral Analysis

**Usage Patterns**
- Abnormal posting frequency (spam)
- Rapid account changes (evasion)
- Multiple accounts from same IP
- Suspicious donation patterns

---

## Database Schema

### New Tables

#### 1. `content_scans`
Tracks all scanning operations
```sql
CREATE TABLE content_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL, -- 'realtime', 'scheduled', 'manual'
  content_type TEXT NOT NULL, -- 'blog_post', 'page', 'image', 'section'
  content_id UUID NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_scans_tenant ON content_scans(tenant_id);
CREATE INDEX idx_content_scans_status ON content_scans(status);
```

#### 2. `content_violations`
Records detected violations
```sql
CREATE TABLE content_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES content_scans(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  violation_type TEXT NOT NULL, -- 'hate_speech', 'nsfw', 'spam', 'copyright', etc.
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  confidence_score DECIMAL(3,2), -- 0.00-1.00 from AI models
  details JSONB, -- Full AI response, matched keywords, etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed', 'enforced'
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_violations_tenant ON content_violations(tenant_id);
CREATE INDEX idx_violations_status ON content_violations(status);
CREATE INDEX idx_violations_severity ON content_violations(severity);
```

#### 3. `enforcement_actions`
Track enforcement history
```sql
CREATE TABLE enforcement_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id UUID REFERENCES content_violations(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'warning', 'content_removal', 'suspension', 'ban'
  reason TEXT NOT NULL,
  duration_days INTEGER, -- For temporary suspensions
  effective_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  admin_id UUID REFERENCES users(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enforcement_tenant ON enforcement_actions(tenant_id);
CREATE INDEX idx_enforcement_type ON enforcement_actions(action_type);
```

#### 4. `violation_appeals`
Handle dispute process
```sql
CREATE TABLE violation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id UUID REFERENCES content_violations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  appeal_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  reviewed_by UUID REFERENCES users(id),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_appeals_status ON violation_appeals(status);
CREATE INDEX idx_appeals_tenant ON violation_appeals(tenant_id);
```

#### 5. `moderation_rules`
Configurable detection rules
```sql
CREATE TABLE moderation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type TEXT NOT NULL, -- 'keyword', 'pattern', 'url', 'custom'
  rule_value TEXT NOT NULL, -- The actual keyword, regex pattern, etc.
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rules_active ON moderation_rules(is_active);
CREATE INDEX idx_rules_type ON moderation_rules(rule_type);
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Time Estimate:** 12-16 hours

1. Database schema setup
   - Create all moderation tables
   - Set up RLS policies
   - Create indexes for performance

2. Core scanning service
   - OpenAI Moderation API integration
   - Text content scanning function
   - Basic rule-based keyword detection

3. Server actions for scans
   - `scanContent()` - Scan single piece of content
   - `scheduleFullScan()` - Queue full tenant audit
   - `getViolations()` - Retrieve violations for tenant

### Phase 2: Real-Time Scanning (Week 2-3)
**Time Estimate:** 10-12 hours

1. Content creation hooks
   - Scan blog posts on publish
   - Scan pages on save
   - Scan image uploads (using fal.ai)

2. Automatic flagging
   - Insert violations into database
   - Calculate severity scores
   - Trigger notifications for high-severity

3. Tenant notifications
   - Email alerts for violations
   - In-app notification system
   - Grace period before enforcement

### Phase 3: Admin Dashboard (Week 3-4)
**Time Estimate:** 16-20 hours

1. Moderation queue UI
   - List all pending violations
   - Filter by severity, tenant, type
   - Batch review capabilities
   - Content preview with context

2. Violation detail view
   - Full content display
   - AI confidence scores
   - Related violations history
   - Quick action buttons (approve/dismiss/enforce)

3. Tenant violation history
   - Timeline of all violations
   - Enforcement actions taken
   - Pattern detection (repeat offender)
   - Export reports

### Phase 4: Enforcement System (Week 4-5)
**Time Estimate:** 12-16 hours

1. Progressive enforcement workflow
   - Warning system (3 strikes)
   - Automatic content hiding
   - Temporary account suspension
   - Permanent bans

2. Enforcement actions
   - Hide/unpublish content
   - Disable donation acceptance
   - Lock tenant account
   - Send enforcement emails

3. Appeals process
   - Tenant appeal submission form
   - Admin appeal review queue
   - Reinstatement workflow
   - Appeal decision notifications

### Phase 5: Advanced Features (Week 5-6)
**Time Estimate:** 14-18 hours

1. Scheduled full-site scans
   - Cron job for weekly audits
   - Batch processing for performance
   - Progress tracking
   - Summary reports

2. Image content moderation
   - fal.ai NSFW detection
   - Logo/brand detection
   - OCR for text in images
   - Thumbnail flagging in admin

3. Custom rules engine
   - UI for adding/editing rules
   - Regex pattern builder
   - Test rule against content
   - Rule versioning

4. Reporting & analytics
   - Violation trends over time
   - Most common violation types
   - Response time metrics
   - False positive rates

---

## Technical Architecture

### Scanning Flow

```
Content Created/Updated
  ↓
Real-Time Scan Triggered
  ↓
┌─────────────────────────┐
│  Content Scan Service   │
│  - Extract text/URLs    │
│  - Prepare for analysis │
└─────────────────────────┘
  ↓
┌──────────────────┬────────────────────┐
│  OpenAI          │  Rule-Based        │
│  Moderation API  │  Detection         │
│  (Text Analysis) │  (Keywords/URLs)   │
└──────────────────┴────────────────────┘
  ↓
Aggregate Results & Calculate Severity
  ↓
Severity >= Threshold?
  ↓
┌─────YES──────┐         ┌─────NO──────┐
│ Create       │         │ Log Scan    │
│ Violation    │         │ Pass        │
│ Record       │         └─────────────┘
└──────────────┘
  ↓
Notify Admin (High/Critical)
  ↓
Notify Tenant (All Violations)
  ↓
Auto-Enforcement (Critical Only)
```

### API Endpoints

**Server Actions**
```typescript
// Scanning
scanContent(contentType: string, contentId: string)
scanTenantSite(tenantId: string)
rescanContent(violationId: string)

// Violations
getViolations(tenantId?: string, status?: string)
getViolationDetails(violationId: string)
reviewViolation(violationId: string, decision: 'dismiss' | 'enforce')

// Enforcement
enforceAction(violationId: string, actionType: string, notes?: string)
suspendTenant(tenantId: string, durationDays: number, reason: string)
reinstateContent(violationId: string)

// Appeals
submitAppeal(violationId: string, reason: string)
reviewAppeal(appealId: string, decision: 'approve' | 'deny', notes?: string)

// Rules Management
createRule(ruleData: ModerationRule)
updateRule(ruleId: string, updates: Partial<ModerationRule>)
toggleRule(ruleId: string, isActive: boolean)
```

**Cron Jobs**
```typescript
// /api/cron/scan-tenants
// Daily full-site scans for all active tenants
POST /api/cron/scan-tenants
Authorization: Bearer CRON_SECRET

// /api/cron/process-violations  
// Process pending violations, send reminders
POST /api/cron/process-violations
Authorization: Bearer CRON_SECRET

// /api/cron/expire-suspensions
// Automatically reinstate expired suspensions
POST /api/cron/expire-suspensions
Authorization: Bearer CRON_SECRET
```

---

## Violation Types & Severities

### Violation Categories

| Type | Description | Default Severity |
|------|-------------|------------------|
| `hate_speech` | Discriminatory or hateful content | Critical |
| `harassment` | Bullying or threatening behavior | High |
| `nsfw_content` | Sexual or adult content | Critical |
| `violence` | Violent or graphic content | High |
| `illegal_activity` | Promotion of illegal services | Critical |
| `spam` | Repetitive or promotional spam | Medium |
| `copyright` | Suspected copyright infringement | Medium |
| `misinformation` | False or misleading claims | Medium |
| `phishing` | Suspected phishing/scam | Critical |
| `policy_violation` | General T&C violation | Low-High |

### Severity Levels

**Low (0.3 - 0.5)**
- Warning email sent
- Content remains visible
- Logged for pattern detection

**Medium (0.5 - 0.7)**
- Warning email + in-app notification
- Content flagged for review
- Second offense: content hidden

**High (0.7 - 0.9)**
- Content automatically hidden
- Tenant must appeal or edit
- Multiple offenses: temporary suspension

**Critical (0.9 - 1.0)**
- Content immediately removed
- Account temporarily suspended
- Admin review required for reinstatement

---

## Enforcement Workflow

### Progressive Discipline

**First Offense (Low/Medium)**
1. Send warning email
2. Log violation
3. Provide 48-hour grace period to edit
4. Content remains visible

**Second Offense (Medium/High)**
1. Content automatically hidden
2. Notification with violation details
3. Tenant must acknowledge and fix
4. Manual admin review required

**Third Offense (High/Critical)**
1. 7-day account suspension
2. All content unpublished
3. Donations disabled
4. Admin review for reinstatement

**Critical Violations (Immediate)**
1. Content removed immediately
2. Account suspended pending review
3. No automatic reinstatement
4. May result in permanent ban

### Appeal Process

1. **Tenant Submits Appeal**
   - Provide detailed explanation
   - Attach supporting evidence
   - Suggest content corrections

2. **Admin Reviews**
   - Review original content & context
   - Check AI confidence scores
   - Consider tenant history
   - Make decision within 72 hours

3. **Decision Communicated**
   - Approved: Content reinstated, violation removed
   - Denied: Maintain enforcement, provide detailed reason
   - Partial: Allow edit and resubmit

---

## Admin Dashboard UI

### Main Moderation Queue

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ 🚨 Moderation Queue                  [ Filters ]│
├─────────────────────────────────────────────────┤
│ ⚠️  Critical (3)  |  High (12)  |  Medium (45)  │
├─────────────────────────────────────────────────┤
│                                                  │
│ ┌─ Violation Card ────────────────────────────┐│
│ │ 🔴 CRITICAL - Hate Speech                   ││
│ │ Tenant: John Doe (johndoe.tekton...)       ││
│ │ Content: Blog Post - "My Mission Update"   ││
│ │ Detected: 2 hours ago                      ││
│ │                                             ││
│ │ Confidence: 95% | AI: OpenAI Moderation   ││
│ │ Excerpt: "[flagged content preview...]"   ││
│ │                                             ││
│ │ [View Details] [Dismiss] [Enforce Action]  ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ ┌─ Violation Card ────────────────────────────┐│
│ │ 🟠 HIGH - NSFW Image                       ││
│ │ ...                                         ││
│ └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Filters:**
- Status (Pending, Reviewed, Dismissed, Enforced)
- Severity (Critical, High, Medium, Low)
- Type (All violation types)
- Tenant (Search/filter by tenant)
- Date range

### Violation Detail View

**Components:**
1. **Violation Summary**
   - Type, severity, confidence score
   - Detection method (AI model, rule)
   - Timestamp and tenant info

2. **Content Display**
   - Full content with highlighted violations
   - Context (surrounding text, page location)
   - Image preview if applicable

3. **AI Analysis**
   - Category breakdown with scores
   - Specific reasons flagged
   - Alternative interpretations

4. **Tenant History**
   - Previous violations
   - Current strikes
   - Enforcement actions taken

5. **Action Panel**
   - Dismiss with reason
   - Enforce action (dropdown: warning, hide, suspend, ban)
   - Add admin notes
   - Contact tenant button

### Rules Management

**Interface:**
```
┌─────────────────────────────────────┐
│ Moderation Rules      [+ Add Rule] │
├─────────────────────────────────────┤
│                                      │
│ ┌─ Rule ──────────────────────────┐│
│ │ Type: Keyword Blacklist         ││
│ │ Value: [prohibited term]        ││
│ │ Violation: Hate Speech          ││
│ │ Severity: Critical              ││
│ │ Status: ✅ Active               ││
│ │ [Edit] [Disable] [Delete]      ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## Email Notifications

### Violation Warning Email
```
Subject: Action Required: Content Violation Detected

Hi [Tenant Name],

We've detected content on your Tekton's Table page that may violate 
our Terms of Service.

Violation Type: [Type]
Content: [Page/Post Title]
Severity: [Level]
Detected: [Date/Time]

What you need to do:
1. Review the flagged content in your admin panel
2. Edit or remove the content within 48 hours
3. Contact support if you believe this is an error

[View Violation] [Edit Content]

This is [strike count] of 3 warnings. Additional violations may 
result in account suspension.

Need help? Reply to this email or visit our Help Center.

Best regards,
Tekton's Table Team
```

### Enforcement Action Email
```
Subject: Important: Account Action Taken

Hi [Tenant Name],

Due to a violation of our Terms of Service, we've taken the 
following action on your account:

Action: [Suspension/Content Removal/Ban]
Reason: [Detailed explanation]
Effective: [Date]
Duration: [Days or Permanent]

What happens next:
[Specific steps for appeal or reinstatement]

To appeal this decision:
[Appeal Link]

Best regards,
Tekton's Table Team
```

---

## Testing Strategy

### Automated Tests

1. **Unit Tests**
   - AI API integration mocks
   - Rule matching logic
   - Severity calculation
   - Enforcement workflow

2. **Integration Tests**
   - Content scan end-to-end
   - Violation creation and retrieval
   - Enforcement action execution
   - Appeal submission and review

3. **Test Data**
   - Sample content with known violations
   - Edge cases (borderline content)
   - False positive scenarios
   - Multi-language content

### Manual Testing Scenarios

1. **Content Scanning**
   - Create blog post with prohibited keywords
   - Upload NSFW image
   - Add suspicious external links
   - Verify detection and flagging

2. **Admin Review**
   - Review flagged content
   - Dismiss false positives
   - Enforce actions
   - Verify email notifications

3. **Appeal Process**
   - Submit appeal as tenant
   - Review as admin
   - Test approval/denial flows
   - Verify reinstatement

---

## Privacy & Ethics Considerations

### Data Handling

1. **Content Storage**
   - Store only metadata and excerpts, not full content
   - Automatically delete old scan results (90 days)
   - Anonymize content in examples/training

2. **AI Processing**
   - Content sent to OpenAI is not stored by them (per policy)
   - No personally identifiable info in API calls
   - Opt-out for tenants who prefer manual review

3. **Transparency**
   - Clear documentation on what's scanned
   - Visibility into detection methods
   - Explanation for each violation

### Bias Prevention

1. **AI Model Selection**
   - Use multiple models to cross-validate
   - Test for cultural and religious bias
   - Adjust confidence thresholds per category

2. **Human Review**
   - All critical violations reviewed by admin
   - Regular audit of dismissed cases
   - Tenant feedback loop

3. **Continuous Improvement**
   - Track false positive rates
   - Retrain rules based on appeals
   - Community standards updates

---

## Performance Considerations

### Optimization Strategies

1. **Async Processing**
   - Queue scans for background processing
   - Don't block content publish on scan
   - Batch process scheduled scans

2. **Caching**
   - Cache scan results for unchanged content
   - Store AI model responses (24 hours)
   - Rate limit re-scans

3. **Database Indexing**
   - Index on tenant_id, status, severity
   - Partial indexes for pending violations
   - Optimize queries with explain analyze

4. **API Rate Limits**
   - OpenAI: 3,500 requests/minute (free tier)
   - Implement retry with exponential backoff
   - Priority queue for real-time vs. scheduled

### Scalability

**Current Load Estimate:**
- 2 active tenants
- Average 10 content pieces per tenant per week
- ~20 scans/week = negligible load

**Future Scale (100 tenants):**
- ~1,000 scans/week
- ~4,000 scans/month
- Well within OpenAI free tier limits

**Scale Plan:**
- At 1,000 tenants: Consider paid OpenAI tier
- At 10,000 tenants: Self-hosted ML models (Llama, Mistral)

---

## Cost Analysis

### Current (2 tenants, Phase 1-3)

**Development Time:**
- Phase 1-3: ~38-48 hours
- At $100/hour: $3,800-$4,800 one-time cost

**Monthly Operating Costs:**
- OpenAI Moderation API: $0 (free tier sufficient)
- Database storage: ~$0.10/month (minimal data)
- Cron jobs: Included in Vercel

**Total Year 1:** ~$4,000-$5,000

### Future Scale (100 tenants)

**Monthly Operating Costs:**
- OpenAI API: ~$20-50/month (if exceeding free tier)
- Additional database: ~$5/month
- Monitoring/alerts: ~$10/month

**Total Monthly at Scale:** ~$35-65/month

---

## Success Metrics

### Key Performance Indicators

1. **Detection Accuracy**
   - True positive rate > 90%
   - False positive rate < 5%
   - Time to detection < 5 minutes

2. **Response Time**
   - Average admin review time < 24 hours
   - Appeal decision time < 72 hours
   - Content reinstatement < 1 hour after approval

3. **Platform Health**
   - Total violations per 1,000 content pieces
   - Repeat offender rate
   - Successful appeal rate (target: 10-15%)

4. **Operational Efficiency**
   - Admin time per review < 5 minutes
   - Automated enforcement rate (critical only)
   - Scan processing time < 30 seconds

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create database schema migration
- [ ] Set up RLS policies for moderation tables
- [ ] Integrate OpenAI Moderation API
- [ ] Create `scanContent()` server action
- [ ] Build basic keyword blacklist
- [ ] Test text content scanning
- [ ] Create violation severity calculator

### Phase 2: Real-Time Scanning
- [ ] Add scan hook to blog post publish
- [ ] Add scan hook to page save
- [ ] Add scan hook to image upload (fal.ai)
- [ ] Implement automatic violation flagging
- [ ] Create tenant notification emails
- [ ] Add grace period logic
- [ ] Test real-time scanning flow

### Phase 3: Admin Dashboard
- [ ] Create moderation queue page
- [ ] Build violation card components
- [ ] Add filtering and sorting
- [ ] Create violation detail view
- [ ] Build action panel (dismiss/enforce)
- [ ] Add tenant violation history
- [ ] Implement batch review tools

### Phase 4: Enforcement System
- [ ] Create enforcement action types
- [ ] Build warning system (3 strikes)
- [ ] Implement content hiding
- [ ] Add account suspension logic
- [ ] Create enforcement emails
- [ ] Build appeal submission form
- [ ] Create appeal review workflow
- [ ] Test full enforcement flow

### Phase 5: Advanced Features
- [ ] Create weekly scan cron job
- [ ] Build progress tracking UI
- [ ] Add image NSFW detection (fal.ai)
- [ ] Create custom rules UI
- [ ] Build rule testing tool
- [ ] Add violation analytics dashboard
- [ ] Create summary reports
- [ ] Document system for tenants

---

## Next Steps

1. **Review & Approve Plan**
   - Stakeholder review of detection methods
   - Legal review of enforcement policies
   - Finalize Terms of Service language

2. **Prioritize Features**
   - Determine must-haves for launch
   - Identify nice-to-haves for later
   - Set timeline and milestones

3. **Begin Implementation**
   - Start with Phase 1 (Foundation)
   - Test with small dataset
   - Iterate based on feedback

4. **Pilot Testing**
   - Enable for 2-3 test tenants
   - Monitor false positives
   - Refine detection rules

5. **Full Rollout**
   - Enable real-time scanning for all tenants
   - Launch admin dashboard
   - Communicate system to existing tenants

---

## Support & Documentation

### Tenant Resources

1. **Help Center Articles**
   - "Community Standards & Content Policy"
   - "Understanding Content Violations"
   - "How to Appeal a Violation"
   - "Best Practices for Content"

2. **In-App Guidance**
   - Tooltips on content editor
   - Pre-publish checklist
   - Content guidelines link

3. **Support Channels**
   - Email: moderation@tektonstable.com
   - In-app help widget
   - Community forum for questions

### Admin Resources

1. **Moderation Guidelines Document**
   - How to review violations
   - Edge case examples
   - Escalation procedures

2. **Training Materials**
   - Video walkthrough of dashboard
   - Decision-making framework
   - Cultural sensitivity training

---

## Appendix

### Example Content Policy Violations

**Hate Speech Example:**
- "I refuse to support [protected group] because..."
- Action: Critical violation, content removed

**NSFW Content Example:**
- Uploaded beach photo with suggestive content
- Action: High violation, content flagged for review

**Spam Example:**
- 5 identical posts within 1 hour
- Action: Medium violation, warning issued

**Policy Violation Example:**
- Soliciting donations for non-mission purposes
- Action: High violation, account review

### OpenAI Moderation Categories

```typescript
interface ModerationResponse {
  id: string;
  model: string;
  results: [{
    flagged: boolean;
    categories: {
      hate: boolean;
      'hate/threatening': boolean;
      harassment: boolean;
      'harassment/threatening': boolean;
      'self-harm': boolean;
      'self-harm/intent': boolean;
      'self-harm/instructions': boolean;
      sexual: boolean;
      'sexual/minors': boolean;
      violence: boolean;
      'violence/graphic': boolean;
    };
    category_scores: {
      hate: number; // 0.0 - 1.0
      'hate/threatening': number;
      harassment: number;
      'harassment/threatening': number;
      'self-harm': number;
      'self-harm/intent': number;
      'self-harm/instructions': number;
      sexual: number;
      'sexual/minors': number;
      violence: number;
      'violence/graphic': number;
    };
  }];
}
```

### Sample Moderation Rules

```json
[
  {
    "rule_type": "keyword",
    "rule_value": "bitcoin giveaway",
    "violation_type": "spam",
    "severity": "high",
    "is_active": true
  },
  {
    "rule_type": "pattern",
    "rule_value": "(?i)(cash app|venmo|paypal).*\\$\\d+",
    "violation_type": "policy_violation",
    "severity": "medium",
    "is_active": true
  },
  {
    "rule_type": "url",
    "rule_value": "bit.ly/.*",
    "violation_type": "phishing",
    "severity": "high",
    "is_active": true
  }
]
```

---

## Conclusion

This content moderation system provides a comprehensive, scalable solution for maintaining platform integrity while respecting tenant privacy and creativity. The progressive enforcement approach balances automated efficiency with human oversight, ensuring fair treatment of missionaries while protecting the Tekton's Table community.

**Estimated Total Implementation Time:** 64-82 hours  
**Estimated Total Cost (Year 1):** $4,000-$5,000  
**Target Launch:** 6 weeks from approval  

Ready to begin implementation upon approval.
