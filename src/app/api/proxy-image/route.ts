import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const imageName = searchParams.get("imageName");
	if (!imageName) {
		return NextResponse.json({ error: "Image name is required" }, { status: 400 });
	}
	const imageUrl = `https://api.dracania-archives.com/images/${imageName}.png`;
	const response = await fetch(imageUrl);
	if (!response.ok) {
		return NextResponse.json({ error: "Image not found" }, { status: 404 });
	}
	const imageBlob = await response.blob();
	const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
	const resizedImageBuffer = await sharp(imageBuffer).resize(30, 30).toBuffer();
	return new Response(resizedImageBuffer, {
		headers: {
			"Content-Type": "image/png",
			"Content-Length": resizedImageBuffer.length.toString()
		}
	});
}
