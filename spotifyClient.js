// spotifyClient.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const {
  SPOTIFY_CLIENT_ID: CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: CLIENT_SECRET,
} = process.env;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env");
}

let cachedToken = null;
let cachedTokenExpiresAt = 0; // unix ms

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );

  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
    }
  );

  cachedToken = res.data.access_token;
  // expires_in is in seconds
  cachedTokenExpiresAt = now + (res.data.expires_in - 60) * 1000; // 60s safety margin

  return cachedToken;
}

export async function spotifyGet(path, params = {}) {
  const token = await getAccessToken();

  const res = await axios.get(`https://api.spotify.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });

  return res.data;
}

// convenience example helpers:

export async function searchTrack(query, limit = 3) {
  return spotifyGet("/search", {
    q: query,
    type: "track",
    limit,
  });
}

export async function getArtist(artistId) {
  return spotifyGet(`/artists/${artistId}`);
}
