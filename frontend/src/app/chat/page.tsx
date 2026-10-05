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
import ChatMessages from '@/src/components/ChatMessages'
import MessageInput from '@/src/components/MessageInput'
import { ReactJsxRuntime } from 'next/dist/server/route-modules/app-page/vendored/rsc/entrypoints'
import { SocketData } from '@/src/context/SocketContext'

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

const page = () => {
  const { loading, isAuth, logoutUser, chats, user: loggedInUser, users, fetchChats, setChats } = useAppData()   // loggedInUser = me / current logged-in account

  const {onlineUsers} = SocketData()
  console.log(onlineUsers)

  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [message, setMessage] = useState("") // for the message input field
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[] | null>(null) // for the messages of the selected chat
  const [user, setUser] = useState<User | null>(null) // selected person I am chatting with
  const [showAllUser, setShowAllUser] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)


  const router = useRouter()

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login")
    }
  }, [isAuth, router, loading])

  const handleLogout = () => logoutUser()

  async function fetchChat() {
    const token = Cookies.get("token")
    try {
      const { data } = await axios.get(`${chat_service}/api/v1/message/${selectedUser}`, {
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

  async function createChat(u: User) {
    try {
      const token = Cookies.get("token")
      const { data } = await axios.post(`${chat_service}/api/v1/chat/new`, { userId: loggedInUser?._id, otherUserId: u._id }, {
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

  const handleMessageSend = async (e: any, imageFile?: File | null) => {
    e.preventDefault()
    if (!message.trim() && !imageFile) return;

    // socket work
    const token = Cookies.get("token")
    try {
      const formData = new FormData()
      formData.append("chatId", selectedUser!)

      if (message.trim()) {
        formData.append("text", message)
      }

      if (imageFile) {
        formData.append("image", imageFile)
      }

      const { data } = await axios.post(`${chat_service}/api/v1/message`, formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setMessages((prev) => {
        const currentMessages = prev || [];
        const messageExists = currentMessages.some((msg) => msg._id === data.message._id);
        if (!messageExists) {
          return [...currentMessages, data.message];
        }
        return currentMessages;
      });

      setMessage("")

      const displayText = imageFile? "image" : "message"
    } catch (error: any ) {
      toast.error(error.response.data.message)

    }
  }

  const handleTyping = (value: string) => {
    setMessage(value)
    if (!selectedUser) return;

    // socket setup
  }

  useEffect(() => {
    if (selectedUser) {
      fetchChat()
    }
  }, [selectedUser])

  if (loading) return <Loading />;
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
        onlineUsers={onlineUsers}
      />
      <div className='flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10'>
        <ChatHeader user={user} setSidebarOpen={setSidebarOpen} isTyping={isTyping} onlineUsers={onlineUsers} />

        <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser} />
        <MessageInput selectedUser={selectedUser} message={message} handleMessageSend={handleMessageSend} setMessage={handleTyping} />
      </div>
    </div>
  )
}

export default page
