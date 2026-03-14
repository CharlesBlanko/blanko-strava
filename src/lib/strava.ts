export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  friend: string;
  follower: string;
  created_at: string;
  updated_at: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  calories: number;
}

export interface StravaClubMember {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  member_since: string;
  admin: boolean;
  owner: boolean;
}

export interface StravaClubActivity {
  id: number;
  resource_state: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_cadence: number;
  average_watts: number;
  weighted_average_watts: number;
  kilojoules: number;
  device_watts: boolean;
  has_heartrate: boolean;
  average_heartrate: number;
  max_heartrate: number;
  max_watts: number;
  pr_count: number;
  suffer_score: number;
  athlete: {
    id: number;
    username: string;
    resource_state: number;
    firstname: string;
    lastname: string;
    city: string;
    state: string;
    country: string;
    sex: string;
    profile: string;
    profile_medium: string;
    friend: string;
    follower: string;
  };
}

export class StravaAPI {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = import.meta.env.STRAVA_CLIENT_ID || '';
    this.clientSecret = import.meta.env.STRAVA_CLIENT_SECRET || '';
    this.redirectUri = import.meta.env.STRAVA_REDIRECT_URI || 'http://localhost:4321/auth/callback';
  }

  getAuthUrl(): string {
    const scopes = 'read,activity:read,profile:read_all';
    return `https://www.strava.com/oauth/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&approval_prompt=force&scope=${scopes}`;
  }

  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: StravaAthlete;
  }> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    return response.json();
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
  }> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    return response.json();
  }

  async getClubMembers(clubId: string, accessToken: string): Promise<StravaClubMember[]> {
    const response = await fetch(`https://www.strava.com/api/v3/clubs/${clubId}/members`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get club members: ${response.statusText}`);
    }

    return response.json();
  }

  async getClubActivities(clubId: string, accessToken: string): Promise<StravaClubActivity[]> {
    const response = await fetch(`https://www.strava.com/api/v3/clubs/${clubId}/activities`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get club activities: ${response.statusText}`);
    }

    return response.json();
  }

  async getAthleteActivities(accessToken: string, page = 1, perPage = 200): Promise<StravaActivity[]> {
    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get athlete activities: ${response.statusText}`);
    }

    return response.json();
  }

  async checkClubMembership(clubId: string, accessToken: string): Promise<boolean> {
    try {
      const members = await this.getClubMembers(clubId, accessToken);
      const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!athleteResponse.ok) {
        return false;
      }

      const athlete = await athleteResponse.json();
      return members.some(member => member.id === athlete.id);
    } catch (error) {
      console.error('Error checking club membership:', error);
      return false;
    }
  }
}
