"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import SetForm from "./setForm";

export default function SetsPage({ params }: { params: { className: string } }) {
	const className = params.className;
	const router = useRouter();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Add new set</CardTitle>
			</CardHeader>
			<SetForm className={className} setSet={() => {}} />
		</Card>
	);
}
