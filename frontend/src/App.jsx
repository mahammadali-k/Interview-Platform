
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import ProblemsPage from './pages/ProblemsPage'
import { Toaster } from 'react-hot-toast'


function App() {
 

  const {isSignedIn} = useUser()

  return (

    <>
    <Routes>
      
 


  <Route path='/' element={<HomePage/>}/>
  {/* <Route path='/about' element={<AboutPage/>}/> */}
  <Route path ='/problems' element={isSignedIn ? <ProblemsPage/> :<Navigate to='/'/>}/>

    </Routes>
    <Toaster position='top-center' toastOptions={{duration:3000}}/>
    </>
  )
}

export default App


//tw,daisyui,react-router,react-hot-toast,
//todo:add video call, code editor,problem statements from backend,submission system,admin panel,react-query aka tanstack query,axios