import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { NextRequest, NextResponse } from "next/server";

const mailerSend = new MailerSend({
	apiKey: process.env.MAILERSEND_API_KEY as string
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(req: NextRequest, res: NextResponse) {
	const emailParams = new EmailParams()
		.setFrom(new Sender("donations@dracania-archives.com", "Dracania Archives Donations"))
		.setTo([new Recipient("marcoantolini.dev@gmail.com", "Marco Antolini")])
		.setSubject("New donation for Dracania Archives")
		.setText(
			"A new donation has been made to Dracania Archives. Check the dashboard to verify it: https://dashboard.stripe.com/dashboard."
		);
	await mailerSend.email.send(emailParams);
	return NextResponse.json({ message: "Email sent", success: true });
}
