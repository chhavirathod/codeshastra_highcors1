import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { lat, lng } = await request.json();

    // Simple geo-fence check
    const geoFence = {
        minLat: 18.98101006968666,
        maxLat: 19.192111747441615,
        minLng: 72.79850980462794,
        maxLng: 72.97901361907108,
    };

    const isAllowed =
      lat >= geoFence.minLat &&
      lat <= geoFence.maxLat &&
      lng >= geoFence.minLng &&
      lng <= geoFence.maxLng;

    return NextResponse.json({ isAllowed });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}