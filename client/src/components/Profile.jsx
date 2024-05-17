import React, { useContext, useEffect, useRef, useState } from 'react'
import UpdateProfile from './UpdateProfile';
import { AppContext } from '../utils/context'
import { FaMapPin } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { FaPhone } from "react-icons/fa";
import { RiLogoutBoxLine } from 'react-icons/ri';
import { useLogout } from '../utils/functions';
import { openModal } from '../utils/functions';
import ChangePassword from './ChangePassword';

function Profile() {
    const { userData } = useContext(AppContext);
    const [gender, setGender] = useState();

    const updateProfileModalRef = useRef(null);
    const changePasswordModalRef = useRef(null);

    useEffect(() => {
        switch (userData.gender) {
            case "male":
                setGender("Male");
                break;
            case "female":
                setGender("Female");
                break;
            case "others":
                setGender("Others");
                break;
            default:
                setGender("NULL");
                break;
        }
    }, [])



    return (
        <div className='flex flex-col justify-center items-center gap-2 p-16'>
            <div className='flex flex-col items-center gap-6 mb-6'>
                <div className='w-48 h-48 border rounded-full flex items-center justify-center'>
                    {userData.profileimage != null ? (
                        <img
                            src={userData.profileimage}
                            alt="profile image"
                            className='rounded-full w-full h-full object-cover '
                        />
                    ) : (
                        <p>Such empty</p>
                    )}
                </div>
                <UpdateProfile modalRef={updateProfileModalRef} />
                <button onClick={() => openModal(updateProfileModalRef)} className='rounded-lg bg-gray-300 px-3 py-2 shadow-md'>Edit Profile</button>
            </div>

            <p className='font-semibold text-lg'><span className='text-xs'>Full Name: </span> {userData.firstname} {userData.lastname}</p>
            <p className='flex flex-row gap-2 items-center'><FaMapPin />{userData.address != null ? userData.address : "NULL"}</p>
            <p className='flex flex-row gap-2 items-center'><IoMdMail />{userData.email}</p>
            <p className='flex flex-row gap-2 items-center'> <FaPhone />{userData.phonenumber != null ? userData.phonenumber : "NULL"}</p>
            <p>Gender: {gender}</p>


            <button onClick={() => openModal(changePasswordModalRef)} className='border border-lg bg-white rounded px-2 py-1 justify-center text-md font-semibold shadow-md'>
                <p className=''>Change Password</p>
            </button>
            <ChangePassword modalRef={changePasswordModalRef} />



            <button onClick={useLogout()} className='flex flex-row items-center border border-lg bg-white rounded px-2 py-1 justify-center text-md font-semibold shadow-md'>
                <RiLogoutBoxLine className='text-xl bg-white text-[#4f41bc]' />
                <p className=''>Log-out</p>
            </button>


        </div>
    )
}

export default Profile