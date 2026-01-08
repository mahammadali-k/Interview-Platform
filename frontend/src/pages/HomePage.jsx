import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

function HomePage() {
  return (
    <div>
      <button className="btn btn-primary" onClick={() => toast.success("This a success toast")}
        >
            Primary Button

        </button>

      <SignedOut>
        <SignInButton mode="modal">
          <button className="btn btn-secondary">Log In</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}

export default HomePage;