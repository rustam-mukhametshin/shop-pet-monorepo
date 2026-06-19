import mongoose from "mongoose";

const Schema = mongoose.Schema;

const twoFASchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  secret: {
    type: Schema.Types.String,
    required: true,
  }
}, {
  timestamps: true
})


export const TwoFAModel = mongoose.model('TwoFA', twoFASchema);