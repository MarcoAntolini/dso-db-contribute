import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { NextRequest, NextResponse } from "next/server";

const mailerSend = new MailerSend({
	apiKey: process.env.MAILERSEND_API_KEY as string
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(req: NextRequest, res: NextResponse) {
	const { receipt_email, amount, currency } = await req.json();
	const emailParams = new EmailParams()
		.setFrom(new Sender("donations@dracania-archives.com", "Dracania Archives"))
		.setTo([new Recipient(receipt_email)])
		.setSubject("Donation confirmation for Dracania Archives").setHtml(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; background-color: rgb(13, 148, 136); color: #ffffff; padding: 20px 0; border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <h1 style="margin: 0; font-size: 24px;">Thank You for Your Donation!</h1>
      </div>
      <div style="padding: 20px; font-size: 16px; line-height: 1.6;">
        <p>Dear <strong>${receipt_email}</strong>,</p>
        <p>
          Your donation of <span style="color: rgb(13, 148, 136); font-weight: bold;">${amount} ${currency}</span> has been received. Thank you for your contribution!
          <span style="color: #e25555;">💖</span>
        </p>
        <p>
          This means a lot to us, and we are incredibly grateful for your support. Your generosity helps us maintain and grow <strong>Dracania Archives</strong>, and we couldn’t do it without people like you!
        </p>
        <p>With sincere thanks,</p>
        <p>The Dracania Archives team</p>
      </div>
      <div style="text-align: center; padding: 10px 20px; background-color: #f4f4f4; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; font-size: 12px; color: #888;">
        <p>Visit us at <a href="https://dracania-archives.com" style="color: rgb(13, 148, 136); text-decoration: none;">Dracania Archives</a></p>
      </div>
    </div>
  </body>
</html>
			`);
	await mailerSend.email.send(emailParams);
	return NextResponse.json({ message: "Email sent", success: true });
}
