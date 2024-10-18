import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "dotenv/config";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900"
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900"
});

export const metadata: Metadata = {
	title: "Dracania Archives Contributor"
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ConvexClientProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						<Header className="hidden custom-size:flex" />
						<main className="pt-20 pb-10 h-[calc(100vh-65px)]">
							<div className="hidden custom-size:flex flex-1 flex-col items-center gap-10 px-10 pb-20">{children}</div>
							<div className="custom-size:hidden flex flex-col items-center mt-32 text-center">
								<p className="text-3xl italic mx-8">
									This web app is not designed for mobile devices or small screens.
								</p>
							</div>
						</main>
						<Toaster richColors closeButton />
					</ThemeProvider>
				</ConvexClientProvider>
			</body>
		</html>
	);
}
