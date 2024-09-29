import { NextResponse } from "next/server";
import { getArtist } from "./spotify";
import type { ArtistResponse, NowPlayingResponse, SongResponse } from "./types";

export const allowedOrigins = [
  "http://localhost:3000", // FIXME - Remove this in production
  "https://mehmetyigityalim.com",
  "https://v2.mehmetyigityalim.com",
  "https://api.mehmetyigityalim.com",
] as const;

export function getCorsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(
      origin as (typeof allowedOrigins)[number],
    )
      ? (origin as string)
      : (allowedOrigins[0] as string),
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function processNowPlayingData(
  song: SongResponse,
  status: number,
): Promise<NowPlayingResponse> {
  const artistsData = await fetchArtistsData(song.item.artists);

  return {
    status,
    album: song.item.album.name,
    isAlbum: song.item.type === "album",
    albumImageUrl: song.item.album.images[0]?.url ?? "",
    albumImageWidth: song.item.album.images[0]?.width ?? 300,
    albumImageHeight: song.item.album.images[0]?.height ?? 300,
    albumReleaseDate: song.item.album.release_date,
    artists: artistsData,
    isPlaying: song.is_playing,
    songUrl: song.item.external_urls.spotify,
    title: song.item.name,
    songPreviewUrl: song.item.preview_url,
  };
}

export async function fetchArtistsData(
  artists: SongResponse["item"]["artists"],
) {
  const artistPromises = artists.map(async (artist) => {
    try {
      const artistResponse = await getArtist(artist.id);
      const artistData = (await artistResponse.json()) as ArtistResponse;
      return {
        id: artist.id,
        name: artist.name,
        url: artist.external_urls.spotify,
        image: artistData.images[0]?.url ?? null,
      };
    } catch (error) {
      return {
        id: artist.id,
        name: artist.name,
        url: artist.external_urls.spotify,
        image: null,
      };
    }
  });

  return Promise.all(artistPromises);
}

export function methodNotAllowed(): NextResponse<{
  error: string;
  status: number;
}> {
  return NextResponse.json(
    { error: "Method Not Allowed", status: 405 },
    { status: 405, headers: { Allow: "GET, OPTIONS" } },
  );
}
