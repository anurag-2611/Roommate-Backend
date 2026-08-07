import { Message } from "../models/message.model.js";
import { UserProfile } from "../models/userProfile.model.js";

const getFriendUserId = async (currentUserId, friendProfileId) => {
  const currentProfile = await UserProfile.findOne({ user: currentUserId });

  if (
    !currentProfile ||
    !currentProfile.friends.some(
      (id) => id.toString() === friendProfileId.toString(),
    )
  ) {
    return null;
  }

  const friendProfile = await UserProfile.findById(friendProfileId).select(
    "user",
  );

  return friendProfile?.user || null;
};

const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { friendId } = req.params;
    const friendUserId = await getFriendUserId(myId, friendId);

    if (!friendUserId) {
      return res.status(404).json({
        success: false,
        message: "Friend not found",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: friendUserId },
        { senderId: friendUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const receiverUserId = await getFriendUserId(senderId, receiverId);

    if (!receiverUserId) {
      return res.status(404).json({
        success: false,
        message: "Friend not found",
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId: receiverUserId,
      text: text.trim(),
    });

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

export {getMessages , sendMessage}
