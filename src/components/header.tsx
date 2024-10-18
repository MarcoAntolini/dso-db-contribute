"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList
} from "@/components/ui/navigation-menu";
import { House } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
	{
		name: "Dwarf",
		href: "/Dwarf",
		image: "/images/dwarf_logo.png"
	},
	{
		name: "Ranger",
		href: "/Ranger",
		image: "/images/ranger_logo.png"
	},
	{
		name: "Warrior",
		href: "/Warrior",
		image: "/images/warrior_logo.png"
	},
	{
		name: "Mage",
		href: "/Mage",
		image: "/images/mage_logo.png"
	}
];

export default function Header({ className }: { className: string }) {
	const pathname = usePathname();

	return (
		<header className={`bg-background border-b sticky top-0 z-50 ${className}`}>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="flex-shrink-0">
						<House />
						<span className="sr-only">Home page</span>
					</Link>
					<NavigationMenu>
						<NavigationMenuList className="space-x-8">
							{navItems.map((item) => (
								<NavigationMenuItem key={item.href}>
									<NavigationMenuLink
										href={item.href}
										className={`flex items-center font-bold text-lg hover:text-primary transition-colors
											${pathname === item.href ? "text-primary" : "text-muted-foreground"}`}
									>
										<Image src={item.image} alt={`${item.name} icon`} width={35} height={35} className="mr-2" />
										{item.name}
									</NavigationMenuLink>
								</NavigationMenuItem>
							))}
						</NavigationMenuList>
					</NavigationMenu>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
