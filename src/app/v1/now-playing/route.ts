import { getArtist, getNowPlaying } from "@/lib/spotify";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 0;

const allowedOrigins = [
  "https://mehmetyigityalim.com",
  "https://v2.mehmetyigityalim.com",
  "https://api.mehmetyigityalim.com",
] as const;

function getCorsHeaders(origin: string | null): HeadersInit {
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
  status: number;
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    const response = await getNowPlaying();

    if (response.status === 204) {
      return NextResponse.json(
        { status: 204 },
        { status: 204, headers: corsHeaders },
      );
    }

    const song = (await response.json()) as SongResponse;

    if (song.item === null) {
      return NextResponse.json(
        { status: 204 },
        { status: 204, headers: corsHeaders },
      );
    }

    const nowPlayingData = await processNowPlayingData(song, response.status);
    return NextResponse.json(nowPlayingData, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: unknown) {
    console.log(error);
    return NextResponse.json(
      {
        error: "An error occurred while fetching data",
        status: 500,
        errorMessage: (error as Error).message,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

async function processNowPlayingData(
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

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(): Promise<NextResponse> {
  return methodNotAllowed();
}

export async function PUT(): Promise<NextResponse> {
  return methodNotAllowed();
}

export async function PATCH(): Promise<NextResponse> {
  return methodNotAllowed();
}

export async function DELETE(): Promise<NextResponse> {
  return methodNotAllowed();
}

function methodNotAllowed(): NextResponse {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "GET, OPTIONS" },
  });
}
