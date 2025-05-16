import { Schema, model, models } from 'mongoose'

const uploadSchema = new Schema(
  {
    key: String,
    name: String,
    url: String,
    size: Number,
    uploaderId: String, // Clerk userId or custom field
  },
  { timestamps: true }
)

const Upload = models.Upload || model('Upload', uploadSchema)
export default Upload
