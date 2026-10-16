import { clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

// clerkMiddleware (in server.js) already parsed the session. For an API we answer 401, not a redirect
export const protectRoute = [
  async (req, res, next) => {
    try {
      const clerkId = req.auth?.().userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - please sign in" });

      // look the user up by their Clerk id
      let user = await User.findOne({ clerkId });

      // local dev: the Clerk -> Inngest webhook can't reach localhost, so we create the user on their first request
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

      // make the user available to the next handlers
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
