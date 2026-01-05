import { requireAuth } from "@clerk/express";
import User from "../models/User.js";


export const protectRoute = [
    requireAuth(),
    async (req, res, next) => {
        try {
            const clerkId = req.auth().userId;
            if (!clerkId)
                return res.status(401).json({ msg: 'Unauthorized: No user ID found' });

            // find user in db by clerk id
            const user = await User.findOne({ clerkId: clerkId })

            if (!user)
                return res.status(404).json({ msg: 'Unauthorized: User not found' });


            req.user = user; // attach user to req 
            next();

        } catch (error) {
            console.log("Error in protectRoute middleware",error)
            return res.status(500).json({ msg: 'Internal Server Error   : ' + error.message });
        }

    }

]