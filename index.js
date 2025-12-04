// index.js
import { searchTrack, getArtist } from "./spotifyClient.js";

async function main() {
  try {
    console.log("1) Searching for tracks: 'Rammstein Sonne'...");
    const searchResult = await searchTrack("Rammstein Sonne", 2);

    const tracks = searchResult.tracks.items;
    console.log(
      "Found tracks:",
      tracks.map((t) => `${t.name} – ${t.artists[0].name}`)
    );

    if (tracks.length === 0) {
      console.log("No tracks found, aborting.");
      return;
    }

    // Take artist from first track
    const firstArtistId = tracks[0].artists[0].id;

    console.log("\n2) Fetching artist details for first track's artist...");
    const artist = await getArtist(firstArtistId);

    console.log("Artist name:", artist.name);
    console.log("Followers:", artist.followers.total);
    console.log("Genres:", artist.genres.join(", "));

    // Next sequential call example: get that artist's top tracks
    console.log("\n3) Fetching artist top tracks (CH market)...");
    const topTracksRes = await fetchArtistTopTracks(firstArtistId, "CH");

    console.log(
      "Top tracks:",
      topTracksRes.tracks.map((t) => `${t.name} (${t.popularity})`)
    );

    console.log("\nDone 🎧");
  } catch (err) {
    console.error("Error while calling Spotify:", err.response?.data || err);
  }
}

// simple helper in same file:
import { spotifyGet } from "./spotifyClient.js";

async function fetchArtistTopTracks(artistId, market = "CH") {
  return spotifyGet(`/artists/${artistId}/top-tracks`, { market });
}

main();
