// spotifyClient.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI,
} = process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REDIRECT_URI) {
  throw new Error(
    "Fehlende SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REDIRECT_URI in .env"
  );
}

export function getAuthUrl() {
  const scopes = ["user-library-read"];
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: scopes.join(" "),
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
  }).toString();

  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
      },
    }
  );

  return {
    accessToken: res.data.access_token,
    refreshToken: res.data.refresh_token,
    expiresIn: res.data.expires_in,
  };
}

export async function fetchAllLikedTracks(accessToken) {
  let url = "https://api.spotify.com/v1/me/tracks?limit=50";
  const all = [];

  while (url) {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = res.data;
    const items = data.items || [];

    for (const item of items) {
      if (item.track) {
        all.push(item.track);
      }
    }

    url = data.next;
  }

  return all;
}

export async function unlikeTracks(accessToken, trackIds = []) {
  if (trackIds.length === 0) return;

  const chunks = [];
  while (trackIds.length > 0) {
    chunks.push(trackIds.splice(0, 50));
  }

  for (const chunk of chunks) {
    await axios.delete(
      "https://api.spotify.com/v1/me/tracks",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        params: {
          ids: chunk.join(",")
        }
      }
    );
  }
}
