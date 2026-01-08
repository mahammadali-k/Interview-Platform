// import React, { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
// import { useEffect } from "react";
// import axios from "axios";
// import axiosInstance from "../lib/axios";
function HomePage() {

  // await axiosInstance.post("/session/123")


    //fetch some data - without using tanstack

    // const [books,setBooks] = useState([])
    // const [isLoading,setIsLoading] = useState(true)
    // const [error,setError] = useState(null)

    // useEffect(()=>{
    //     const getBooks = async () => {
    //         setIsLoading(true)
    //         try{
    //                  const res = await fetch("/api/books")
    //         const data = await res.json()
    //         setBooks(data)
    //         }catch(error){
    //             setError(error);
    //         }finally{
    //             setIsLoading(false)
    //         }
        
    //     }

        //refetch
        //when you focus on the window - it fetches data immedately again
        
        
    //     getBooks()
    // },[])
    
    //with tanstack
    

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