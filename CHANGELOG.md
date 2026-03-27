# Changelog

## 2026-03-26

### Fixed
- **Analytics page auth**: Added try/catch error handling, proper error destructuring from Supabase calls, changed `.single()` to `.maybeSingle()`, and ensured loading state clears on errors
- **Help page loading**: Replaced manual `dataLoading` state with SWR's built-in `isLoading`, fixing the button stuck on "Loading..."

### Added
- **Mobile menu navigation**: Added QR Code and Need Help? items to mobile menu
  - QR Code appears after Analytics
  - Need Help? appears after Settings
  - Full order: Dashboard, Manage Giving, Blog Posts, Campaigns, Supporters, Newsletter, Contact Forms, Analytics, QR Code, Navigation, About Page, Settings, Need Help?

### Files Changed
- `app/[tenant]/admin/analytics/page.tsx`
- `app/[tenant]/admin/help/page.tsx`
- `components/tenant/tenant-admin-mobile-menu.tsx`
