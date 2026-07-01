"use client"
import { ArrowRight, Loader2, Lock } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const VerifyPage = () => {
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]) 
  const [error, setError] = useState<string>("")
  const [resendLoading, setResendLoading] = useState<boolean>(false)
  const [timer, setTimer] = useState<number>(60) 
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const router = useRouter()

  const searchParams = useSearchParams() 
  const email: string = searchParams.get('email') || "" // Extract the email parameter

  useEffect(() => {
    if(timer>0){
      const interval = setInterval(()=>{
        setTimer((prev)=>prev -1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleInputChange = (index: number, value: string): void => {
    if(value.length> 1) return;
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    if(value && index < 5){
      inputRefs.current[index+1]?.focus()
    }
  }

  const handleKeyDown = (index:number, e: React.KeyboardEvent<HTMLInputElement>): void=> {
    if(e.key === "Backspace" && !otp[index] && index > 0){
      inputRefs.current[index-1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>):void => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').slice(0, 6)
    if(digits.length === 6){
      const newOtp = digits.split('')
      setOtp(newOtp)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async() => {}
  return <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <div className='bg-gray-800 border border-gray-700 rounded-lg p-8'>
            <div className='text-center mb-8'>
              <div className='mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6'>
                <Lock size={40} className='text-white' />
              </div>
              <h1 className='text-4xl font-bold text-white mb-3'>Verify your email</h1>
              <p className='text-gray-300 text-lg'>We have sent 6-digit code to </p>
              <p className='text-blue-400 font-medium'>{email}</p>
            </div>
            <form onSubmit={handleSubmit} className='space-y-6'>
                <div>
                    <label htmlFor="email" className='block text-sm font-medium text-gray-300 mb-2'>
                        Email Adress
                    </label>
                    <input 
                    type="email" 
                    id='email' 
                    className='w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400' 
                    placeholder='Enter Your email address'
                    //value={email} // Bind the input value to the email state
                    // onChange={(e) => setEmail(e.target.value)} // Update the email state on input change
                    required 
                    />
                </div>
                <button
                type='submit'
                className='w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disable:opacity-50 disabled:cursor-not-allowed '
                disabled={loading} // Disable the button when loading
                >
                  {loading? (
                    <div className='flex items-center justify-center gap-2'>
                      <Loader2 className='w-5 h-5' />
                      Verifing...
                    </div>
                  ) : (
                    <div className='flex items-center justify-center gap-2'>
                      <span>Verify</span>
                      <ArrowRight  className='w-5 h-5'/>
                    </div>
                  )
                }
                
                </button>
            </form>
        </div>
      </div>
    </div>
}

export default VerifyPage
