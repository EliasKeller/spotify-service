// index.js
import express from "express";
import {
  getAuthUrl,
  exchangeCodeForToken,
  fetchAllLikedTracks,
} from "./spotifyClient.js";

const app = express();
const PORT = 3000;

const ARTIST_TO_UNLIKE = "";

app.get("/", (req, res) => {
  res.send(`
    <h1>Spotify Liked Songs Tool</h1>
    <p>Schritt 1: <a href="/login">Spotify Login starten</a></p>
  `);
});


app.get("/login", (req, res) => {
  console.log("➡️  Schritt 1: Redirect zu Spotify Login");
  const url = getAuthUrl();
  res.redirect(url);
});


app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Kein 'code' von Spotify erhalten");
  }

  try {
    console.log("🎵 Schritt 3: Hole alle Liked Songs...");
    const tracks = await fetchAllLikedTracks(accessToken);

    console.log(`🔍 Filtere alle '${ARTIST_TO_UNLIKE}' Songs…`);
    const blockedTracks = tracks.filter(track =>
      track.artists.some(a => a.name.toLowerCase() === ARTIST_TO_UNLIKE)
    );

    console.log(`Gefunden: ${blockedTracks.length} zu löschende Songs`);
    const blockedIds = blockedTracks.map(t => t.id);

    console.log("🗑️ Lösche aus deiner Spotify Bibliothek…");
    await unlikeTracks(accessToken, blockedIds);

    console.log("✅ Fertig – alle unerwünschten Songs wurden entfernt!");
  } catch (err) {
    console.error("Fehler im Callback:", err.response?.data || err);
    res.status(500).send("Fehler beim Abrufen der Liked Songs.");
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
  console.log(
    `Ablauf:\n 1) Öffne http://localhost:${PORT}\n 2) Klick auf "Spotify Login starten"`
  );
});
