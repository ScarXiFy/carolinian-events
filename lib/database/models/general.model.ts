import { Schema, model, models } from "mongoose"

const GeneralSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true, unique: true },
  photo: { type: String, required: true },
})

const General = models.General || model("General", GeneralSchema)

export default General