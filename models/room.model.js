import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["1RK", "2RK", "1BHK", "2BHK", "3BHK", "SHARED", "FLAT", "PG"],
      required: true,
    },

    roomAvailable: {
      type: Number,
      required: true,
    },

    bathrooms: {
      type: Number,
      required: false,
    },

    rent: {
      type: Number,
      required: true,
    },

    nearestCity: {
      type: String,
      required: true,
    },

    connectivity: {
      type: String,
      required: false,
    },

    phoneNumber: {
      type: Number,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true, // automatically converts to lowercase
    },

    photos: [
      {
        type: String,
      },
    ],

    videos: [
      {
        type: String,
      },
    ],

    thumbnail: {
      type: String,
      required: true,
    },

    rentalTerms: {
        type: String,
        required: true,
    },

  },
  { timestamps: true },
);

export const Room = mongoose.model("Room", RoomSchema);
