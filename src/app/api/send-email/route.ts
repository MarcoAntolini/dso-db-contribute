import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { NextRequest, NextResponse } from "next/server";

const mailerSend = new MailerSend({
	apiKey: process.env.MAILERSEND_API_KEY as string
});

export async function POST(req: NextRequest, res: NextResponse) {
	const { type, name } = await req.json();
	const emailParams = new EmailParams()
		.setFrom(new Sender("contributor@dracania-archives.com", "Dracania Archives Contributor"))
		.setTo([new Recipient("marcoantolini.dev@gmail.com", "Marco Antolini")])
		.setSubject("New item suggestion")
		.setText(`A new ${type} has been created: ${name}`);
	await mailerSend.email.send(emailParams);
	return NextResponse.json({ message: "Email sent", success: true });
}
