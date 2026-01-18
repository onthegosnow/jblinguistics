// Microsoft Graph API helper for Teams integration

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID;

// Cache for access token
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get an access token for Microsoft Graph API using client credentials flow
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET || !MICROSOFT_TENANT_ID) {
    throw new Error("Microsoft credentials not configured");
  }

  const tokenUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      client_secret: MICROSOFT_CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Microsoft access token: ${error}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

/**
 * Find a user by email in the Microsoft 365 tenant
 */
export async function findUserByEmail(email: string): Promise<{ id: string; displayName: string; mail: string } | null> {
  const token = await getAccessToken();

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users?$filter=mail eq '${encodeURIComponent(email)}' or userPrincipalName eq '${encodeURIComponent(email)}'`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    console.error("Failed to find user:", await response.text());
    return null;
  }

  const data = await response.json();
  if (data.value && data.value.length > 0) {
    return {
      id: data.value[0].id,
      displayName: data.value[0].displayName,
      mail: data.value[0].mail || data.value[0].userPrincipalName,
    };
  }

  return null;
}

export type TeamsMeeting = {
  id: string;
  joinUrl: string;
  joinWebUrl: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
};

/**
 * Create a Teams online meeting
 */
export async function createTeamsMeeting(params: {
  organizerEmail: string;
  subject: string;
  startDateTime: Date;
  endDateTime: Date;
  attendeeEmails?: string[];
}): Promise<TeamsMeeting> {
  const token = await getAccessToken();

  // Find the organizer user
  const organizer = await findUserByEmail(params.organizerEmail);
  if (!organizer) {
    throw new Error(`Organizer not found in Microsoft 365: ${params.organizerEmail}`);
  }

  // Create the meeting
  const meetingPayload = {
    subject: params.subject,
    startDateTime: params.startDateTime.toISOString(),
    endDateTime: params.endDateTime.toISOString(),
    participants: {
      organizer: {
        identity: {
          user: {
            id: organizer.id,
            displayName: organizer.displayName,
          },
        },
      },
      attendees: params.attendeeEmails?.map((email) => ({
        upn: email,
        role: "attendee",
      })),
    },
    lobbyBypassSettings: {
      scope: "everyone",
      isDialInBypassEnabled: true,
    },
  };

  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${organizer.id}/onlineMeetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meetingPayload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Teams meeting: ${error}`);
  }

  const meeting = await response.json();

  return {
    id: meeting.id,
    joinUrl: meeting.joinUrl,
    joinWebUrl: meeting.joinWebUrl,
    subject: meeting.subject,
    startDateTime: meeting.startDateTime,
    endDateTime: meeting.endDateTime,
  };
}

/**
 * Check if Microsoft Teams integration is configured
 */
export function isTeamsConfigured(): boolean {
  return !!(MICROSOFT_CLIENT_ID && MICROSOFT_CLIENT_SECRET && MICROSOFT_TENANT_ID);
}

/**
 * Generate a Teams meeting link for a class session
 */
export async function createMeetingForSession(params: {
  className: string;
  teacherEmail: string;
  startTime: Date;
  endTime: Date;
  studentEmails?: string[];
}): Promise<{ meetingUrl: string; meetingId: string } | null> {
  if (!isTeamsConfigured()) {
    console.log("Teams not configured, skipping meeting creation");
    return null;
  }

  try {
    const meeting = await createTeamsMeeting({
      organizerEmail: params.teacherEmail,
      subject: `${params.className} - Class Session`,
      startDateTime: params.startTime,
      endDateTime: params.endTime,
      attendeeEmails: params.studentEmails,
    });

    return {
      meetingUrl: meeting.joinWebUrl || meeting.joinUrl,
      meetingId: meeting.id,
    };
  } catch (error) {
    console.error("Failed to create Teams meeting:", error);
    return null;
  }
}
