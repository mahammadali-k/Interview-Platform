import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk ID
      let user = await User.findOne({ clerkId });

      // local dev: the Clerk -> Inngest webhook can't reach localhost, so create the user on first request
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(clerkId);

        user = await User.create({
          clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
          profileImage: clerkUser.imageUrl,
        });

        await upsertStreamUser({
          id: user.clerkId.toString(),
          name: user.name,
          image: user.profileImage,
        });
      }

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
