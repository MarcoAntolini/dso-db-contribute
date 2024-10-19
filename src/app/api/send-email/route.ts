import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { NextRequest, NextResponse } from "next/server";

const mailerSend = new MailerSend({
	apiKey: process.env.MAILERSEND_API_KEY as string
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(req: NextRequest, res: NextResponse) {
	const { type, class: className, name } = await req.json();
	const emailParams = new EmailParams()
		.setFrom(new Sender("contributor@dracania-archives.com", "Dracania Archives Contributor"))
		.setTo([new Recipient("marcoantolini.dev@gmail.com", "Marco Antolini")])
		.setSubject(`New ${className} ${type} contribution for Dracania Archives: ${name}`)
		.setText(`The new ${type} ${className.toLowerCase()} has been added and is awaiting review:
			https://dashboard.convex.dev/t/marcoantolini/dso-db-contribute/intent-mule-355/data?table=${type}s&filters=${
				type === "item"
					? "eyJjbGF1c2VzIjpbeyJvcCI6ImVxIiwiaWQiOiIwLjkzMTI2OTEzNDI2OTU4MDUiLCJmaWVsZCI6ImFwcHJvdmVkIiwidmFsdWUiOmZhbHNlfV19"
					: "eyJjbGF1c2VzIjpbeyJvcCI6ImVxIiwiaWQiOiIwLjI4MzUwNTg3MTQyOTY0MSIsImZpZWxkIjoiYXBwcm92ZWQiLCJ2YWx1ZSI6ZmFsc2V9XX0"
			}`);
	await mailerSend.email.send(emailParams);
	return NextResponse.json({ message: "Email sent", success: true });
}
