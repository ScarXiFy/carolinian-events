import { Schema, model, models } from "mongoose"

const ParticipantSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  photo: { type: String, required: true },
})

const Participant = models.Participant || model("General", ParticipantSchema)

export default Participant