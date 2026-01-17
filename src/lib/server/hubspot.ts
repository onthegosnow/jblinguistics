/**
 * HubSpot CRM Integration
 *
 * This module handles syncing contacts and deals to HubSpot.
 * Uses HubSpot's free CRM API.
 *
 * Setup:
 * 1. Create a HubSpot account at https://app.hubspot.com/signup/crm
 * 2. Go to Settings > Integrations > Private Apps
 * 3. Create a new private app with scopes: crm.objects.contacts.write, crm.objects.deals.write
 * 4. Copy the access token to HUBSPOT_ACCESS_TOKEN env var
 */

const HUBSPOT_API_BASE = "https://api.hubapi.com";
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export type HubSpotContactInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  website?: string;
  // Custom properties
  serviceInterest?: string;
  languagesNeeded?: string;
  budget?: string;
  timeline?: string;
  source?: string;
  message?: string;
  preferredStaff?: string;
  marketingOptIn?: boolean;
};

export type HubSpotContact = {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type HubSpotDealInput = {
  dealName: string;
  pipeline?: string;
  stage?: string;
  amount?: number;
  contactId?: string;
  // Custom properties
  serviceType?: string;
  languages?: string;
};

export type HubSpotDeal = {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

/**
 * Check if HubSpot integration is configured
 */
export function isHubSpotConfigured(): boolean {
  return !!HUBSPOT_ACCESS_TOKEN;
}

/**
 * Create or update a contact in HubSpot
 * Uses email as unique identifier - will update if exists
 */
export async function syncContactToHubSpot(
  input: HubSpotContactInput
): Promise<{ success: boolean; contactId?: string; error?: string }> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    return { success: false, error: "HubSpot not configured" };
  }

  try {
    // Split name into first/last if only firstName provided
    let firstName = input.firstName;
    let lastName = input.lastName;
    if (firstName && !lastName && firstName.includes(" ")) {
      const parts = firstName.split(" ");
      firstName = parts[0];
      lastName = parts.slice(1).join(" ");
    }

    // Build properties object
    const properties: Record<string, string> = {
      email: input.email,
    };

    if (firstName) properties.firstname = firstName;
    if (lastName) properties.lastname = lastName;
    if (input.company) properties.company = input.company;
    if (input.phone) properties.phone = input.phone;
    if (input.website) properties.website = input.website;

    // Custom properties (these need to be created in HubSpot first)
    // We'll use the message/notes field which exists by default
    const notes: string[] = [];
    if (input.serviceInterest) notes.push(`Service Interest: ${input.serviceInterest}`);
    if (input.languagesNeeded) notes.push(`Languages: ${input.languagesNeeded}`);
    if (input.budget) notes.push(`Budget: ${input.budget}`);
    if (input.timeline) notes.push(`Timeline: ${input.timeline}`);
    if (input.message) notes.push(`Message: ${input.message}`);
    if (input.preferredStaff) notes.push(`Preferred Staff: ${input.preferredStaff}`);

    // Use hs_content_membership_notes for storing inquiry details (available in free tier)
    if (notes.length > 0) {
      properties.message = notes.join("\n");
    }

    // Lead source
    if (input.source) {
      properties.hs_lead_status = "NEW";
      // Use lifecyclestage to track
      properties.lifecyclestage = "lead";
    }

    // First, try to find existing contact by email
    const searchRes = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "email",
                  operator: "EQ",
                  value: input.email,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!searchRes.ok) {
      const errorText = await searchRes.text();
      console.error("HubSpot search failed:", errorText);
      // Continue to create - might fail if duplicate
    }

    const searchData = await searchRes.json();
    const existingContact = searchData.results?.[0];

    if (existingContact) {
      // Update existing contact
      const updateRes = await fetch(
        `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${existingContact.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties }),
        }
      );

      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.error("HubSpot update failed:", errorText);
        return { success: false, error: `Failed to update contact: ${errorText}` };
      }

      const updated = await updateRes.json();
      return { success: true, contactId: updated.id };
    } else {
      // Create new contact
      const createRes = await fetch(
        `${HUBSPOT_API_BASE}/crm/v3/objects/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties }),
        }
      );

      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error("HubSpot create failed:", errorText);
        return { success: false, error: `Failed to create contact: ${errorText}` };
      }

      const created = await createRes.json();
      return { success: true, contactId: created.id };
    }
  } catch (err) {
    console.error("HubSpot sync error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create a deal in HubSpot and optionally associate with a contact
 */
export async function createDealInHubSpot(
  input: HubSpotDealInput
): Promise<{ success: boolean; dealId?: string; error?: string }> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    return { success: false, error: "HubSpot not configured" };
  }

  try {
    const properties: Record<string, string | number> = {
      dealname: input.dealName,
      pipeline: input.pipeline || "default",
      dealstage: input.stage || "appointmentscheduled", // Default first stage
    };

    if (input.amount) {
      properties.amount = input.amount;
    }

    // Add description with service details
    const description: string[] = [];
    if (input.serviceType) description.push(`Service: ${input.serviceType}`);
    if (input.languages) description.push(`Languages: ${input.languages}`);
    if (description.length > 0) {
      properties.description = description.join("\n");
    }

    const createRes = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/deals`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ properties }),
      }
    );

    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error("HubSpot deal creation failed:", errorText);
      return { success: false, error: `Failed to create deal: ${errorText}` };
    }

    const deal = await createRes.json();

    // Associate deal with contact if provided
    if (input.contactId) {
      await fetch(
        `${HUBSPOT_API_BASE}/crm/v3/objects/deals/${deal.id}/associations/contacts/${input.contactId}/deal_to_contact`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          },
        }
      );
    }

    return { success: true, dealId: deal.id };
  } catch (err) {
    console.error("HubSpot deal error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Sync an inquiry to HubSpot as a contact
 * This is the main function called when a new inquiry is submitted
 */
export async function syncInquiryToHubSpot(inquiry: {
  name: string;
  email: string;
  organization?: string;
  serviceType?: string;
  languages?: string;
  details?: string;
  budget?: string;
  timeline?: string;
  source?: string;
  metadata?: Record<string, string>;
}): Promise<{ success: boolean; contactId?: string; error?: string }> {
  return syncContactToHubSpot({
    email: inquiry.email,
    firstName: inquiry.name,
    company: inquiry.organization,
    serviceInterest: inquiry.serviceType,
    languagesNeeded: inquiry.languages,
    budget: inquiry.budget,
    timeline: inquiry.timeline,
    source: inquiry.source,
    message: inquiry.details,
    preferredStaff: inquiry.metadata?.preferredStaff,
    marketingOptIn: inquiry.metadata?.marketingOptIn === "true",
  });
}

/**
 * Get a contact from HubSpot by email
 */
export async function getHubSpotContactByEmail(
  email: string
): Promise<HubSpotContact | null> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    return null;
  }

  try {
    const res = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "email",
                  operator: "EQ",
                  value: email,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}
