import { updateEvent } from "@/lib/actions/event.actions";

interface UpdateEventParams {
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDateTime: string;
  endDateTime: string;
  price: string;
  isFree: boolean;
  organizers: Array<{ name: string; socialMedia?: string }>;
  sponsors?: Array<{ name: string; website?: string }>;
  contactEmail: string;
  contactPhone?: string;
  maxAttendees?: number;
  tags: string[];
  requirements?: string;
  category: string; // Added category property
}

export const updateEventWithId = async (eventId: string, formData: UpdateEventParams) => {
  "use server";
  
  try {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.location) {
      throw new Error("Required fields are missing");
    }

    // Validate date formats
    const startDate = new Date(formData.startDateTime);
    const endDate = new Date(formData.endDateTime);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format");
    }

    if (startDate >= endDate) {
      throw new Error("End date must be after start date");
    }

    // Prepare the data for update
    const updateData = {
      eventId: eventId,
      ...formData,
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      // Ensure optional arrays are not undefined
      sponsors: formData.sponsors || [],
      tags: formData.tags || [],
      category: formData.category, // Ensure category is included
    };

    // Execute the update
    const result = await updateEvent(updateData);

    if (!result) {
      throw new Error("Failed to update event - no result returned");
    }

    return {
      success: true,
      message: "Event updated successfully",
      event: result
    };

  } catch (error) {
    console.error("Failed to update event:", error);
    
    let errorMessage = "Failed to update event";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return {
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error : new Error(errorMessage)
    };
  }
};