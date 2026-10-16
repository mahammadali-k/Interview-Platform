import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    // Stream knows people by their Clerk id (not the MongoDB _id), so the token has to be made for that same id
    const token = chatClient.createToken(req.user.clerkId);

    res.status(200).json({
      token,
      userId: req.user.clerkId,
      userName: req.user.name,
      userImage: req.user.image,
    });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
