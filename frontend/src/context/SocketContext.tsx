"use client"

import { Children, createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client"
import { chat_service, useAppData } from "./AppContext";



interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
    socket: null
})

interface ProviderProps {
    children: ReactNode
}

export const SocketProvider = ({ children }: ProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const {user} = useAppData()  //Gets the currently logged-in user from your app context.

    useEffect(() => {
        if(!user?._id) return

        const newSocket = io(chat_service)
        
        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [user?._id])

    return (
        <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
    )
}

export const SocketData = () => useContext(SocketContext)


