import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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
						<div className="flex flex-col min-h-screen">
							<Header />
							<main className="pt-20 pb-10">
								<div className="hidden custom-size:flex flex-1 flex-col items-center h-screen gap-10 px-10">
									{children}
								</div>
								<div className="custom-size:hidden flex flex-col items-center mt-32 text-center">
									<p className="text-3xl italic mx-8">
										This web app is not designed for mobile devices or small screens.
									</p>
								</div>
							</main>
							<Toaster richColors closeButton />
						</div>
					</ThemeProvider>
				</ConvexClientProvider>
			</body>
		</html>
	);
}
