import { Schema, Types, model, models } from "mongoose"

export interface ICategory {
    _id: Types.ObjectId
    name: string
    description?: string
    createdAt: Date
    updatedAt: Date
}

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

const Category = models.Category || model("Category", CategorySchema)

export default Category