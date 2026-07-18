# Orbikt Source Systems

AA01
Status: Ready
Can Build: Yes
Need Integration: Yes

Knowledge
Status: Ready
Can Build: Yes

Dispatch
Status: External System
Integration: Dashboard + Workspace
Can Build: External

Visit Manager
Status: Google Apps Script
Integration: Dashboard + Workspace
Can Build: External

Genogram
Status: Prototype
Can Build: No

LongCare-QA-Engine
Status: Ready
Type: Python Project
Can Build: Python

Auth
Status: V1 Mock/Local; v2 Repository Foundation In Progress
Type: Client-direct Supabase Auth composition
Can Build: Repository sources only
Integration: Cloud Auth not deployed or verified

Team Calendar
Status: V1 Implemented (v1.7.1)
Route: /calendar
Persistence: Browser-local via CalendarAdapter (not multi-user shared)
Source Projections: Visit Manager read-only
Google Calendar: Not synchronized; future optional export only
Next Integration: Shared API/Supabase adapter with server-side authorization/RLS

Orbikt v2 Repository Offline Foundation
Objective: obj-orbikt-v2-cloud-auth-shared-workspace
Status: Governance and Design In Progress
Branch: feat/orbikt-v2-cloud-foundation
Baseline: v1.7.1 / 7dcfae1
Cloud Project: orbikt-v2-staging (empty; not linked or deployed)
Repository Scope: Authorized
Cloud Schema/Auth/RLS/Realtime: Not Deployed / Not Verified
Alias Domain: Missing - Cloud Auth user creation remains blocked
Local Supabase Verification: Not Available (Supabase CLI and Docker missing)
