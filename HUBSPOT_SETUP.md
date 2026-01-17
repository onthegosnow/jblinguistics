# HubSpot CRM Integration Setup

This guide explains how to configure the HubSpot integration for JB Linguistics.

## Overview

The integration syncs contact form inquiries to HubSpot CRM:
- **Automatic sync**: New inquiries are automatically synced to HubSpot when submitted
- **Manual sync**: Admin can manually sync existing inquiries via the "HubSpot" button

## Setup Instructions

### 1. Create a HubSpot Account

If you don't have one, sign up for HubSpot Free CRM at https://www.hubspot.com/

### 2. Get Your Access Token

**Option A: Personal Access Key (Recommended)**

1. Go to HubSpot Developer portal: https://developers.hubspot.com/
2. Click **Keys** → **Personal Access Key**
3. Generate a new key with these scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
4. Copy the access token

**Option B: Create a Project (Alternative)**

1. Go to **Projects** in the Developer portal
2. Create a new project
3. Set up authentication with required scopes
4. Get the access token from the project settings

### 3. Add Environment Variable

Add the following to your `.env.local` (local) or Vercel environment variables:

```
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 4. Deploy

Once the environment variable is set, the integration will automatically:
- Sync new inquiries to HubSpot as contacts
- Enable the "HubSpot" button in the admin inquiries page

## How It Works

### Contact Creation

When an inquiry is synced, a HubSpot contact is created with:

| HubSpot Field | Source |
|---------------|--------|
| Email | inquiry.email |
| First Name | First word of inquiry.name |
| Last Name | Remaining words of inquiry.name |
| Company | inquiry.organization |
| Lead Status | "NEW" |
| Lifecycle Stage | "lead" |
| Message | inquiry.details |

### Custom Properties (Optional)

For richer data tracking, you can create custom properties in HubSpot:

1. Go to **Settings** → **Properties** → **Contact Properties**
2. Create these custom properties:
   - `service_interest` (single-line text)
   - `languages_needed` (single-line text)
   - `budget` (single-line text)
   - `timeline` (single-line text)
   - `inquiry_source` (single-line text)
   - `marketing_opt_in` (checkbox)

The integration will automatically populate these if they exist.

## Admin Usage

### Viewing Sync Status

In the admin inquiries page (`/portal/inquiries`):
- **Marketing column**: Shows "HubSpot synced" for synced contacts
- **Actions column**: Orange "HubSpot" button (disabled if already synced)

### Manual Sync

Click the "HubSpot" button to sync an individual inquiry. This is useful for:
- Inquiries submitted before integration was enabled
- Re-syncing if automatic sync failed

## Troubleshooting

### "Unable to sync to HubSpot" Error

1. Check that `HUBSPOT_ACCESS_TOKEN` is set correctly
2. Verify the token has required scopes (contacts read/write)
3. Check server logs for detailed error messages

### Contact Not Appearing in HubSpot

1. Search by email in HubSpot (contacts may take a few seconds to appear)
2. Check if contact already exists (duplicates are updated, not created)
3. Verify the inquiry has a valid email address

### Duplicate Contacts

The integration checks for existing contacts by email before creating. If duplicates appear:
1. The HubSpot search API may have latency
2. Merge duplicates manually in HubSpot

## API Reference

### Sync Endpoint

```
POST /api/portal/admin/inquiries/[id]
Headers: x-admin-token: <admin-token>
```

Response:
```json
{
  "success": true,
  "contactId": "12345678"
}
```

## Security Notes

- The HubSpot access token is stored server-side only
- Only admins with valid tokens can trigger manual syncs
- Automatic sync failures are non-blocking (inquiry still saves)
