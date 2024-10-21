import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(req: NextRequest, res: NextResponse) {
	const { sessionId } = await req.json();
	const stripe = new Stripe(process.env.STRIPE_KEY as string);
	try {
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		return NextResponse.json(
			{
				payment_status: session.payment_status,
				receipt_email: session.customer_details?.email,
				amount: session.amount_total,
				currency: session.currency
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json({ error: error }, { status: 500 });
	}
}
