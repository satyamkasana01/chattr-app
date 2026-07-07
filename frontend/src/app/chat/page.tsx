"use client"

import ChatSidebar from '@/src/components/ChatSidebar'
import Loading from '@/src/components/Loading'
import { chat_service, useAppData, User } from '@/src/context/AppContext'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import axios from 'axios'
import ChatHeader from '@/src/components/ChatHeader'

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

  async function fetchChat(){
    const token = Cookies.get("token")
    try {
      const {data} = await axios.get(`${chat_service}/api/v1/message/${selectedUser}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      
      })
      setMessages(data.messages)
      setUser(data.user)
      await fetchChats();
    } catch (error) {
      console.log(error)
      toast.error("Failed to fetch chats")
    
      
    }
  }

  async function createChat(u:User){
    try {
      const token = Cookies.get("token")
      const {data} = await axios.post(`${chat_service}/api/v1/chat/new`, {userId: loggedInUser?._id, otherUserId: u._id}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setSelectedUser(data.chatId)
      setShowAllUser(false)
    } catch (error) {
      toast.error("Failed to Start Chat")
    }
  }

  useEffect(()=> {
    if(selectedUser){
      fetchChat()
    }
  },[selectedUser])

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
        createChat={createChat}
      />
      <div className='flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10'>
      <ChatHeader user={user} setSidebarOpen={setSidebarOpen} isTyping={isTyping} />
      </div>
    </div>
  )
}

export default page
