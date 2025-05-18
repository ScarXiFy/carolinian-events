// 'use server'

// import { connectToDatabase } from "@/lib/database/connect"
// //import Participant from "@/lib/database/models/participant.model"
// import Event from "@/lib/database/models/event.model"
// import { revalidatePath } from "next/cache"
// import { jwtVerify } from "jose"
// //import { Types } from "mongoose"

// // Define your JWT secret key here or import it from a secure location
// const secretKey = process.env.JWT_SECRET || "your_default_secret_key";

// // app/actions/event.actions.ts
// export async function leaveEvent({
//   email,
//   userId,
//   eventId,
//   token
// }: {
//   email?: string;
//   userId?: string;
//   eventId: string;
//   token?: string;
// }) {
//   try {
//     await connectToDatabase();

//     // Token verification (for email links)
//     if (token) {
//       const { payload } = await jwtVerify(token, secretKey);
//       email = payload.email;
//       eventId = payload.eventId;
//     }

//     // Validate inputs
//     if (!eventId) throw new Error("Event ID is required");
//     if (!userId && !email) throw new Error("Either user ID or email is required");

//     // Find and delete registration
//     const deletedRegistration = userId
//       ? await Registration.findOneAndDelete({ event: eventId, user: userId })
//       : await Registration.findOneAndDelete({ event: eventId, email });

//     if (!deletedRegistration) {
//       throw new Error("Registration not found");
//     }

//     // Update event participants count
//     await Event.findByIdAndUpdate(eventId, {
//       $inc: { participantsCount: -1 }
//     });

//     revalidatePath(`/events/${eventId}`);
//     return { success: true };
//   } catch (error) {
//     console.error("Leave event error:", error);
//     return { 
//       success: false, 
//       message: error instanceof Error ? error.message : "Failed to leave event" 
//     };
//   }
// }