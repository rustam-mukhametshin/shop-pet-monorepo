import mongoose from "mongoose";

const Schema = mongoose.Schema;

const profileSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  twoFA: {
    type: Boolean,
    required: true,
    default: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  }
}, {
  timestamps: true
})


export const ProfileModel = mongoose.model('Profile', profileSchema);
