import { getArtist, getNowPlaying } from "@/lib/spotify";

export const runtime = "edge";
export const revalidate = 0;

interface SongResponse {
  item: {
    name: string;
    artists: {
      id: string;
      name: string;
      external_urls: {
        spotify: string;
      };
    }[];
    type: "album" | "single";
    album: {
      name: string;
      images: {
        url: string;
        width: number;
        height: number;
      }[];
      release_date: string;
    };
    external_urls: {
      spotify: string;
    };
    preview_url: string;
  };
  is_playing: boolean;
}

interface ArtistResponse {
  images: { url: string; width: number; height: number }[];
}

interface NowPlayingResponse {
  album: string;
  isAlbum: boolean;
  albumImageUrl: string;
  albumImageWidth: number;
  albumImageHeight: number;
  albumReleaseDate: string;
  artists: {
    id: string;
    name: string;
    url: string;
    image: string | null;
  }[];
  isPlaying: boolean;
  songUrl: string;
  title: string;
  songPreviewUrl: string | null;
}

export async function GET(): Promise<Response> {
  try {
    const response = await getNowPlaying();

    if (response.status === 204 || response.status > 400) {
      return createNotPlayingResponse();
    }

    const song = (await response.json()) as SongResponse;

    if (song.item === null) {
      return createNotPlayingResponse();
    }

    const nowPlayingData = await processNowPlayingData(song);
    return createSuccessResponse(nowPlayingData);
  } catch (error) {
    console.error("Error in GET request:", error);
    return createErrorResponse();
  }
}

async function processNowPlayingData(
  song: SongResponse,
): Promise<NowPlayingResponse> {
  const artistsData = await fetchArtistsData(song.item.artists);

  return {
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

async function fetchArtistsData(artists: SongResponse["item"]["artists"]) {
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
      console.error(`Error fetching artist data for ${artist.name}:`, error);
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

function createNotPlayingResponse(): Response {
  return new Response(
    JSON.stringify({
      isPlaying: false,
      currentPlaying: false,
    }),
    { status: 200 },
  );
}

function createSuccessResponse(data: NowPlayingResponse): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "cache-control": "public, s-maxage=60, stale-while-revalidate=30",
      "content-type": "application/json",
    },
  });
}

function createErrorResponse(): Response {
  return new Response(
    JSON.stringify({ error: "An error occurred while fetching data" }),
    { status: 500 },
  );
}

export const POST = async () => new Response(null, { status: 405 });
export const PUT = async () => new Response(null, { status: 405 });
export const PATCH = async () => new Response(null, { status: 405 });
