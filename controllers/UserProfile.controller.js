import { UserProfile } from "../models/userProfile.model.js";

const sendFriendRequest = async (req, res) => {
  try {
    const senderUserId = req.user._id;
    const { receiverProfileId } = req.params;

    const senderProfile = await UserProfile.findOne({ user: senderUserId });
    const receiverProfile = await UserProfile.findById(receiverProfileId);

    if (!senderProfile) {
      return res.status(404).json({ message: "Sender profile not found" });
    }

    if (!receiverProfile) {
      return res.status(404).json({ message: "Receiver profile not found" });
    }

    if (senderProfile._id.toString() === receiverProfile._id.toString()) {
      return res.status(400).json({ message: "You cannot send request to yourself" });
    }

    // for checking in array
    if (senderProfile.friends.includes(receiverProfile._id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    if (senderProfile.friendRequestsSent.includes(receiverProfile._id)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    if (senderProfile.friendRequestsReceived.includes(receiverProfile._id)) {
      return res.status(400).json({ message: "This user already sent you a request" });
    }

    senderProfile.friendRequestsSent.push(receiverProfile._id);
    receiverProfile.friendRequestsReceived.push(senderProfile._id);

    await senderProfile.save();
    await receiverProfile.save();

    return res.status(200).json({
      message: "Friend request sent successfully",
    });
  } catch (error) {
    console.error("Send friend request error:", error);
    return res.status(500).json({ message: "Failed to send friend request" });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { senderProfileId } = req.params;

    const currentProfile = await UserProfile.findOne({ user: currentUserId });
    const senderProfile = await UserProfile.findById(senderProfileId);

    if (!currentProfile) {
      return res.status(404).json({ message: "Current profile not found" });
    }

    if (!senderProfile) {
      return res.status(404).json({ message: "Sender profile not found" });
    }

    const hasRequest = currentProfile.friendRequestsReceived.some(
      (id) => id.toString() === senderProfileId
    );

    if (!hasRequest) {
      return res.status(400).json({ message: "No friend request found" });
    }

    currentProfile.friendRequestsReceived =
      currentProfile.friendRequestsReceived.filter(
        (id) => id.toString() !== senderProfileId
      );

    senderProfile.friendRequestsSent = senderProfile.friendRequestsSent.filter(
      (id) => id.toString() !== currentProfile._id.toString()
    );

    if (!currentProfile.friends.includes(senderProfile._id)) {
      currentProfile.friends.push(senderProfile._id);
    }

    if (!senderProfile.friends.includes(currentProfile._id)) {
      senderProfile.friends.push(currentProfile._id);
    }

    await currentProfile.save();
    await senderProfile.save();

    return res.status(200).json({
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error("Accept friend request error:", error);
    return res.status(500).json({ message: "Failed to accept friend request" });
  }
};

const rejectFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { senderProfileId } = req.params;

    const currentProfile = await UserProfile.findOne({ user: currentUserId });
    const senderProfile = await UserProfile.findById(senderProfileId);

    if (!currentProfile) {
      return res.status(404).json({ message: "Current profile not found" });
    }

    if (!senderProfile) {
      return res.status(404).json({ message: "Sender profile not found" });
    }

    currentProfile.friendRequestsReceived =
      currentProfile.friendRequestsReceived.filter(
        (id) => id.toString() !== senderProfileId
      );

    senderProfile.friendRequestsSent = senderProfile.friendRequestsSent.filter(
      (id) => id.toString() !== currentProfile._id.toString()
    );

    await currentProfile.save();
    await senderProfile.save();

    return res.status(200).json({
      message: "Friend request rejected",
    });
  } catch (error) {
    console.error("Reject friend request error:", error);
    return res.status(500).json({ message: "Failed to reject friend request" });
  }
};

const getMyFriendData = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const profile = await UserProfile.findOne({ user: currentUserId })
      .populate("friends", "userName fullName city avatar")
      .populate("friendRequestsReceived", "userName fullName city avatar")
      .populate("friendRequestsSent", "userName fullName city avatar");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({
      message: "Friend data fetched successfully",
      data: {
        friends: profile.friends,
        receivedRequests: profile.friendRequestsReceived,
        sentRequests: profile.friendRequestsSent,
      },
    });
  } catch (error) {
    console.error("Get friend data error:", error);
    return res.status(500).json({ message: "Failed to fetch friend data" });
  }
};

const removeFriend = async (req, res) => {
  try {
    const myId = req.user._id;
    const { friendId } = req.params;

    const me = await UserProfile.findOne({ user: myId });
    const other = await UserProfile.findById(friendId);

    if (!me || !other) {
      return res.status(404).json({ message: "User not found" });
    }

    // remove from my friends
    me.friends = me.friends.filter(
      (id) => id.toString() !== friendId
    );

    // remove from other user friends
    other.friends = other.friends.filter(
      (id) => id.toString() !== me._id.toString()
    );

    await me.save();
    await other.save();

    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error removing friend" });
  }
};

export {sendFriendRequest ,acceptFriendRequest ,rejectFriendRequest ,getMyFriendData ,removeFriend}