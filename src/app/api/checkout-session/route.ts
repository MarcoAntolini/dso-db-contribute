import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(req: NextRequest, res: NextResponse) {
	const { username } = await req.json();
	const origin = req.headers.get("origin");
	const stripe = new Stripe(process.env.STRIPE_KEY as string);
	const isDev = process.env.NODE_ENV === "development";
	try {
		const session = await stripe.checkout.sessions.create({
			line_items: [{ price: isDev ? "price_1QC5MzCW3bRJsu38XrZc564U" : "price_1QBeikCW3bRJsu38Pc9z9WT0", quantity: 1 }],
			submit_type: "donate",
			custom_fields: [
				{
					key: "name",
					label: {
						type: "custom",
						custom: "Name"
					},
					type: "text",
					text: {
						default_value: username
					},
					optional: true
				}
			],
			mode: "payment",
			payment_method_types: ["card", "paypal"],
			success_url: `${origin}/?status=success&sessionId={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/?status=canceled&sessionId={CHECKOUT_SESSION_ID}`
		});
		if (session.url) {
			return NextResponse.json({ url: session.url }, { status: 200 });
		} else {
			return NextResponse.json({ error: "Session URL is null" }, { status: 500 });
		}
	} catch (error) {
		return NextResponse.json({ error: error }, { status: 500 });
	}
}
