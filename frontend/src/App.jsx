
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'

function App() {
 

  return (
    <>
      
  <h1 className='text-3xl'>Interview Platform</h1>

<SignedOut>
  <SignInButton mode ="modal">
    <button>
      Login
    </button>
  </SignInButton>
  <p>Please sign in to continue.</p>
</SignedOut>



<SignedIn>
  <SignOutButton />
  <p>Welcome to the Interview Platform!</p>
</SignedIn>




<UserButton />

    </>
  )
}

export default App
