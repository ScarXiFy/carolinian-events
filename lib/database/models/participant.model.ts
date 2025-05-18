// lib/database/models/participant.model.ts
import { Schema, model, models } from "mongoose";

const ParticipantSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  joinedEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  createdAt: { type: Date, default: Date.now },
});

const Participant = models.Participant || model("Participants", ParticipantSchema);

export default Participant;