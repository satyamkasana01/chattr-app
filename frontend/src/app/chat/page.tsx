"use client"

import ChatSidebar from '@/src/components/ChatSidebar'
import Loading from '@/src/components/Loading'
import { useAppData, User } from '@/src/context/AppContext'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export interface Message {
  id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?:{
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

const page = () => {
  const {loading, isAuth, logoutUser, chats, user:loggedInUser, users, fetchChats, setChats}= useAppData()   // loggedInUser = me / current logged-in account

  const[selectedUser, setSelectedUser] = useState<string | null>(null)
  const [message, setMessage] = useState("") // for the message input field
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[] | null>(null) // for the messages of the selected chat
  const [user, setUser] = useState<User | null>(null) // selected person I am chatting with
  const [showAllUser, setShowAllUser] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)


  const router = useRouter()
 
  useEffect(()=> {
    if(!isAuth && !loading){
      router.push("/login")
    }
  },[isAuth, router, loading])

  const handleLogout = () =>  logoutUser()

  if(loading) return <Loading />;
  return (
    <div className='min-h-screen flex bg-gray-900 text-white relative overflow-hidden'>
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showAllUser={showAllUser}
        setShowAllUser={setShowAllUser}
        users={users}
        loggedInUser={loggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
      />
    </div>
  )
}

export default page
