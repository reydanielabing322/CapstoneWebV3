import React, { useContext } from 'react'
import { axiosReq } from '../../../utils/axios';
import Logo from '../../../resources/Logo';
import { FaCar } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { FaWallet } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { AppContext } from '../../../utils/context';
import { useNavigate } from 'react-router-dom';

function Navigation({ activeNav, setActiveNav }) {
    const { userData, setIsLoading, isProfileComplete } = useContext(AppContext);
    const navigate = useNavigate();
    async function verifyAccount(e) {
        setIsLoading(true);
        e.target.disabled = true;
        await axiosReq.get("/user/otp");
        setIsLoading(false);
        navigate("/verify");
    }
    return (
        <div className='h-[12vh] border border-b-[#CBD5E1] border-t-[#9CA3AF] border-x-[#9CA3AF] bg-[#eeeeee] flex flex-row items-center px-10 justify-between fixed top-0 left-0 w-screen shadow-md z-40'>
            {!userData.isapproved && (
                <button onClick={(e) => verifyAccount(e)} className='fixed top-0 left-0 h-5 w-full bg-red-600 text-white flex justify-center'>
                    <p className='text-sm'>You are not yet authorized. Click here to get authorized.</p>
                </button>
            )}

            {(!userData.firstname || !userData.lastname || !userData.phonenumber || userData.firstname.trim().length == 0 || userData.lastname.trim().length == 0 || userData.phonenumber.trim().length == 0) && (
                <button onClick={() => setActiveNav("profile")} className='fixed top-0 left-0 h-5 w-full bg-red-600 text-white flex justify-center'>
                    <p className='text-sm'>Please fill in all user information.</p>
                </button>
            )}

            <div onClick={() => setActiveNav("home")} className='cursor-pointer'>
                <Logo width={105} height={63.5} />
            </div>

            <div className='flex flex-row gap-4'>
                <button className='border border-black px-2 py-1 rounded-lg flex flex-row gap-2 items-center shadow-md hover:text-[#4f41bc] transition-all' onClick={() => setActiveNav("home")}>
                    <p>Home</p>
                    <AiFillHome className={`text-3xl ${activeNav == 'home' ? 'text-[#4f41bc]' : ''}`} />
                </button>

                <button className='border border-black px-2 py-1 rounded-lg flex flex-row gap-2 items-center shadow-md hover:text-[#4f41bc] transition-all' onClick={isProfileComplete ? (() => setActiveNav("applications")) : null}>
                    <p>Application Progress</p>
                    <FaWallet className={`text-3xl ${activeNav == 'applications' ? 'text-[#4f41bc]' : ''}`} />
                </button>

                <button className='border border-black px-2 py-1 rounded-lg flex flex-row gap-2 items-center shadow-md hover:text-[#4f41bc] transition-all' onClick={isProfileComplete ? (() => setActiveNav("myDocuments")) : null}>
                    <p>My Documents</p>
                    <FaCar className={`text-3xl ${activeNav == 'myDocuments' ? 'text-[#4f41bc]' : ''}`} />
                </button>

                <button className='border border-black px-2 py-1 rounded-lg flex flex-row gap-2 items-center shadow-md hover:text-[#4f41bc] transition-all' onClick={isProfileComplete ? (() => setActiveNav("notifications")) : null}>
                    <p>Notifications</p>
                    <FaBell className={`text-3xl ${activeNav == 'notifications' ? 'text-[#4f41bc]' : ''}`} />
                </button>

                <button className='border border-black px-2 py-1 rounded-lg flex flex-row gap-2 items-center shadow-md hover:text-[#4f41bc] transition-all' onClick={() => setActiveNav("profile")}>
                    <p>Profile</p>
                    <FaUser className={`text-3xl ${activeNav == 'profile' ? 'text-[#4f41bc]' : ''}`} />
                </button>
            </div>
        </div >

    )
}

export default Navigation