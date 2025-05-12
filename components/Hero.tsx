import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-gray-50 py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">Discover & Manage Events with Carolinian Events</h1>
      <p className="text-lg mb-6 text-gray-600">Easily find, join, or host events in the Carolinian community.</p>
      <Link href="/browse">
        <Button className="text-white">Browse Events</Button>
      </Link>
    </section>
  );
}
