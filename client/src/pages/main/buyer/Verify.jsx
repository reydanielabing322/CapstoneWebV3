import React, { useContext, useEffect, useState, useRef } from 'react'
import { axiosReq } from '../../../utils/axios'
import { toast } from "react-toastify"
import Spinner from '../../../components/Spinner'
import { AppContext } from '../../../utils/context'
import { useNavigate } from 'react-router-dom'
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

function Verify() {
    const { userData, setUserData, isLoading, setIsLoading } = useContext(AppContext);
    const navigate = useNavigate();

    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = useRef([]);

    const handleOtpChange = (e, index) => {
        const { value } = e.target;
        if (/^\d*$/.test(value) && value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value !== '' && index < otp.length - 1) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleBackspace = (e, index) => {
        if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
            inputRefs.current[index - 1].focus();
        }
    };

    async function handleVerifyAccount() {
        try {
            setIsLoading(true)
            const code = otp.join("").toString();
            await axiosReq.post("/buyer/verify", { code })

            const token = Cookies.get("api_access_token");


            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    setUserData(decodedToken)
                } catch (error) {
                    navigate("/");
                }
            } else {
                toast.error("Invalid token")
            }


            toast.success("Verification success")
            navigate("/dashboard");
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    async function handleResendOTP() {
        try {
            setIsLoading(true)
            await axiosReq.get("/user/otp");
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    useEffect(() => {
        if (userData.role != 'buyer' || userData.isapproved == true) {
            navigate("/dashboard");
        }
    }, [])

    useEffect(() => {
        if (otp.every(digit => digit !== '') && !isLoading) {
            handleVerifyAccount();
        }
    }, [otp]);

    return (
        <>
            {isLoading && <Spinner />}
            <div className='flex flex-col justify-center gap-2 items-center w-screen h-screen'>
                <p className='text-xl font-semibold'>Please enter OTP sent to your email</p>
                <button type='button' onClick={handleResendOTP} className='font-semibold px-2 py-1 rounded-lg border bg-[#414fbc] text-white'>Resend Code</button>

                <div className="flex gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(e, index)}
                            onKeyDown={(e) => handleBackspace(e, index)}
                            className='border border-black px-2 py-1 rounded-lg w-12 text-center'
                            ref={(el) => (inputRefs.current[index] = el)}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default Verify