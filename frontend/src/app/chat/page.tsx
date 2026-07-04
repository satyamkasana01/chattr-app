"use client"

import Loading from '@/src/components/Loading'
import { useAppData } from '@/src/context/AppContext'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const page = () => {
  const {loading, isAuth}= useAppData()
  const router = useRouter()

  useEffect(()=> {
    if(!isAuth && !loading){
      router.push("/login")
    }
  },[isAuth, router, loading])

  if(loading) return <Loading />;
  return (
    <div>
      ChatApp
    </div>
  )
}

export default page
