// components/RegisterButton.tsx (alert version)
"use client";

import { Button } from "./ui/button";
import { registerForEvent } from "@/lib/actions/registration.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterButton({
  eventId,
  userId,
}: {
  eventId: string;
  userId?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!userId) {
      router.push(`/sign-in?redirect_url=/events/${eventId}`);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await registerForEvent(eventId, userId);
      
      if (result?.error) {
        alert(result.error); // Browser-native alert
      } else {
        alert("Successfully registered for the event!"); // Browser-native alert
        router.refresh();
      }
    } catch (error) {
        console.error("Registration error:", error);
      alert("Failed to register"); // Browser-native alert
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleRegister}
      disabled={isLoading}
      className="w-full md:w-auto"
    >
      {isLoading ? "Processing..." : "Register for this event"}
    </Button>
  );
}