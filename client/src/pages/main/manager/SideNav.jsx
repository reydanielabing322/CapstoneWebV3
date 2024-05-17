import React, { useContext } from 'react'
import { AppContext } from '../../../utils/context';

import profileImage from '../../../resources/profileImage.png'
import { RiLogoutBoxLine } from "react-icons/ri";
import { FaCar } from "react-icons/fa";
import { useLogout } from "../../../utils/functions.js"

function SideNav({ activeNav, setActiveNav }) {
    const { userData } = useContext(AppContext);
    return (
        <div className='basis-[20%] bg-[#4f41bc] w-full h-full flex flex-col justify-between p-5'>
            <div className='h-[90%] flex flex-col gap-6'>
                <div className='flex flex-col items-center gap-4'>
                    {userData.profileimage ? (
                        <div className='w-40 h-40'>
                            <img src={userData.profileimage} loading="lazy" alt="profileImage" className='w-full h-full rounded-full object-cover' />
                        </div>
                    ) : (
                        <div className=''>
                            <img src={profileImage} loading="lazy" alt="profileImage" width={140} />
                        </div>
                    )}
                    <p className='text-2xl font-bold'>Manager</p>
                </div>



                <div className={`font-semibold text-md flex flex-col gap-1 pl-10`}>
                    <button onClick={() => setActiveNav("dashboard")} className={`flex flex-row gap-2 justify-start p-3 rounded-lg ${activeNav === "dashboard" && 'bg-white'} transition-all`}>
                        <div className='w-[15%]'>
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M16.4204 1.4567C18.258 0.859431 20.2316 1.86505 20.8279 3.7021C21.4248 5.53946 20.4192 7.5128 18.5823 8.10999C16.7453 8.70695 14.7721 7.7014 14.1748 5.86405C13.5782 4.02693 14.5835 2.05335 16.4204 1.4567ZM1.17255 3.70226C1.76917 1.86521 3.74204 0.859589 5.57998 1.45655C7.41694 2.05321 8.42221 4.02708 7.82498 5.86421C7.22835 7.70156 5.2548 8.70711 3.41814 8.10992C1.58028 7.51296 0.574706 5.53961 1.17255 3.70226ZM7.32788 19.8422C6.19208 21.4051 4.00477 21.7515 2.44229 20.6157C0.8792 19.4803 0.532791 17.293 1.66829 15.7301C2.80355 14.1673 4.99079 13.8208 6.55357 14.9561C8.11643 16.0916 8.46314 18.2794 7.32788 19.8422ZM14.6708 19.8424C13.5358 18.2795 13.8822 16.0918 15.4451 14.9562C17.0078 13.8206 19.1948 14.1674 20.3303 15.73C21.4661 17.2928 21.1194 19.4805 19.5566 20.6161C17.9939 21.7517 15.8066 21.4052 14.6708 19.8424Z" fill={`${activeNav == "dashboard" ? "#4f41bc" : "white"}`} />
                                <path d="M16.4204 1.4567L16.5749 1.93224L16.575 1.93221L16.4204 1.4567ZM20.8279 3.7021L20.3523 3.85648L20.3523 3.8566L20.8279 3.7021ZM18.5823 8.10999L18.7368 8.58551L18.7369 8.58549L18.5823 8.10999ZM14.1748 5.86405L13.6993 6.01849L13.6993 6.01862L14.1748 5.86405ZM1.17255 3.70226L1.64801 3.85697L1.6481 3.85671L1.17255 3.70226ZM5.57998 1.45655L5.73444 0.981006L5.73444 0.981005L5.57998 1.45655ZM7.82498 5.86421L7.34947 5.70963L7.34942 5.70979L7.82498 5.86421ZM3.41814 8.10992L3.57275 7.63442L3.57261 7.63438L3.41814 8.10992ZM7.32788 19.8422L7.73235 20.1362L7.73241 20.1361L7.32788 19.8422ZM2.44229 20.6157L2.73629 20.2112L2.73613 20.2111L2.44229 20.6157ZM1.66829 15.7301L2.07279 16.024L2.07282 16.024L1.66829 15.7301ZM6.55357 14.9561L6.84748 14.5516L6.84745 14.5516L6.55357 14.9561ZM14.6708 19.8424L14.2662 20.1362L14.2663 20.1363L14.6708 19.8424ZM15.4451 14.9562L15.739 15.3607L15.739 15.3607L15.4451 14.9562ZM20.3303 15.73L19.9259 16.0239L19.9259 16.0239L20.3303 15.73ZM19.5566 20.6161L19.8506 21.0206L19.8506 21.0206L19.5566 20.6161ZM16.575 1.93221C18.15 1.42029 19.8413 2.28226 20.3523 3.85648L21.3035 3.54773C20.6218 1.44785 18.366 0.298571 16.2659 0.981183L16.575 1.93221ZM20.3523 3.8566C20.864 5.43132 20.0021 7.12265 18.4277 7.63449L18.7369 8.58549C20.8364 7.90295 21.9857 5.64759 21.3034 3.54761L20.3523 3.8566ZM18.4278 7.63447C16.8534 8.14605 15.1623 7.28435 14.6504 5.70949L13.6993 6.01862C14.3819 8.11845 16.6371 9.26785 18.7368 8.58551L18.4278 7.63447ZM14.6504 5.70961C14.139 4.13497 15.0007 2.44354 16.5749 1.93224L16.266 0.981152C14.1662 1.66316 13.0174 3.91889 13.6993 6.01849L14.6504 5.70961ZM1.6481 3.85671C2.1594 2.28236 3.85016 1.42042 5.42553 1.9321L5.73444 0.981005C3.63392 0.298759 1.37895 1.44806 0.696998 3.54782L1.6481 3.85671ZM5.42552 1.93209C6.99968 2.44339 7.86135 4.13504 7.34947 5.70963L8.30048 6.01879C8.98306 3.91912 7.8342 1.66302 5.73444 0.981006L5.42552 1.93209ZM7.34942 5.70979C6.83809 7.28447 5.14668 8.14619 3.57275 7.63442L3.26354 8.58542C5.36292 9.26803 7.61861 8.11865 8.30053 6.01863L7.34942 5.70979ZM3.57261 7.63438C1.99734 7.12271 1.13569 5.4315 1.64801 3.85697L0.697083 3.54755C0.0137263 5.64772 1.16322 7.90321 3.26368 8.58546L3.57261 7.63438ZM6.92341 19.5483C5.94988 20.8879 4.07528 21.1846 2.73629 20.2112L2.14829 21.0201C3.93426 22.3184 6.43427 21.9223 7.73235 20.1362L6.92341 19.5483ZM2.73613 20.2111C1.39652 19.2381 1.0996 17.3635 2.07279 16.024L1.26378 15.4362C-0.034023 17.2225 0.361883 19.7226 2.14845 21.0202L2.73613 20.2111ZM2.07282 16.024C3.04578 14.6846 4.92032 14.3876 6.2597 15.3606L6.84745 14.5516C5.06126 13.2539 2.56133 13.65 1.26375 15.4363L2.07282 16.024ZM6.25967 15.3606C7.59919 16.3339 7.8963 18.209 6.92334 19.5484L7.73241 20.1361C9.02999 18.3498 8.63367 15.8494 6.84748 14.5516L6.25967 15.3606ZM15.0753 19.5486C14.1026 18.2091 14.3995 16.334 15.739 15.3607L15.1512 14.5517C13.3649 15.8496 12.969 18.35 14.2662 20.1362L15.0753 19.5486ZM15.739 15.3607C17.0783 14.3875 18.9525 14.6846 19.9259 16.0239L20.7348 15.436C19.437 13.6502 16.9374 13.2537 15.1511 14.5518L15.739 15.3607ZM19.9259 16.0239C20.8993 17.3633 20.6022 19.2383 19.2627 20.2116L19.8506 21.0206C21.6367 19.7227 22.033 17.2224 20.7348 15.436L19.9259 16.0239ZM19.2627 20.2116C17.9234 21.1848 16.0487 20.888 15.0752 19.5484L14.2663 20.1363C15.5644 21.9225 18.0643 22.3185 19.8506 21.0206L19.2627 20.2116Z" fill="#5041BC" />
                            </svg>
                        </div>
                        <p>Dashboard</p>
                    </button>

                    <button onClick={() => { setActiveNav("vehicles"); }} className={`flex flex-row gap-2 justify-start p-3 rounded-lg ${activeNav === "vehicles" && 'bg-white'} transition-all`}>
                        <div className='w-[15%]'>
                            <FaCar className={`text-xl ${activeNav == "vehicles" ? "text-[#4f41bc]" : "text-[#FFFFFF]"}`} />
                        </div>
                        <p>Vehicles</p>
                    </button>

                    <button onClick={() => setActiveNav("agents")} className={`flex flex-row gap-2 justify-start p-3 rounded-lg ${activeNav === "agents" && 'bg-white'} transition-all`}>
                        <div className='w-[15%]'>
                            <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M17.7093 4.03479H15.6258C15.2841 4.03479 15.0039 3.78715 15.0039 3.48874V2.08182C15.0039 1.08971 13.9736 0.284302 12.708 0.284302H2.29074C1.03026 0.284302 0 1.08971 0 2.08182V18.4868C0 19.475 1.03026 20.2843 2.29074 20.2843H17.7093C18.9749 20.2843 20 19.475 20 18.4868V5.83231C20 4.8402 18.9749 4.03479 17.7093 4.03479Z" fill={`${activeNav == "agents" ? "#4f41bc" : "white"}`} />
                                <path fillRule="evenodd" clipRule="evenodd" d="M18.3355 18.4868C18.3355 18.7883 18.0542 19.0328 17.7084 19.0328H2.28988C1.94819 19.0328 1.66797 18.7883 1.66797 18.4868V2.08182C1.66797 1.7795 1.94819 1.53577 2.28988 1.53577H12.7071C13.0529 1.53577 13.3342 1.7795 13.3342 2.08182V3.48874C13.3342 4.47694 14.3593 5.28235 15.6249 5.28235H17.7084C18.0542 5.28235 18.3355 5.52999 18.3355 5.83231V18.4868Z" fill="white" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M4.16645 6.53394H10.8366C11.296 6.53394 11.6658 6.25349 11.6658 5.9082C11.6658 5.5637 11.296 5.28247 10.8366 5.28247H4.16645C3.70705 5.28247 3.33203 5.5637 3.33203 5.9082C3.33203 6.25349 3.70705 6.53394 4.16645 6.53394Z" fill="#5041BC" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M15.8327 8.61682H4.16645C3.70705 8.61682 3.33203 8.89414 3.33203 9.24255C3.33203 9.58706 3.70705 9.86438 4.16645 9.86438H15.8327C16.2973 9.86438 16.6671 9.58706 16.6671 9.24255C16.6671 8.89414 16.2973 8.61682 15.8327 8.61682Z" fill="#5041BC" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M15.8327 11.9476H4.16645C3.70705 11.9476 3.33203 12.2281 3.33203 12.5734C3.33203 12.9179 3.70705 13.1991 4.16645 13.1991H15.8327C16.2973 13.1991 16.6671 12.9179 16.6671 12.5734C16.6671 12.2281 16.2973 11.9476 15.8327 11.9476Z" fill="#5041BC" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M15.8327 15.2822H4.16645C3.70705 15.2822 3.33203 15.5635 3.33203 15.908C3.33203 16.2525 3.70705 16.5337 4.16645 16.5337H15.8327C16.2973 16.5337 16.6671 16.2525 16.6671 15.908C16.6671 15.5635 16.2973 15.2822 15.8327 15.2822Z" fill="#5041BC" />
                            </svg>
                        </div>
                        <p>Agents</p>
                    </button>

                    <button onClick={() => setActiveNav("notifications")} className={`flex flex-row gap-2 justify-start p-3 rounded-lg ${activeNav === "notifications" && 'bg-white'} transition-all`}>
                        <div className='w-[15%]'>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M17.5 16.3636V10.303C17.5 6.57574 15.4563 3.46665 11.875 2.64244V1.81818C11.875 0.812102 11.0375 0 10 0C8.96251 0 8.12503 0.812102 8.12503 1.81818V2.64244C4.54377 3.46665 2.50002 6.57574 2.50002 10.303V16.3636L0 18.7879V20H20V18.7879L17.5 16.3636Z" fill={`${activeNav == "notifications" ? "#4f41bc" : "white"}`} />
                            </svg>
                        </div>
                        <p>Notifications</p>
                    </button>

                    <button onClick={() => setActiveNav("viewProfile")} className={`flex flex-row gap-2 justify-start p-3 rounded-lg ${activeNav === "viewProfile" && 'bg-white'} transition-all`}>
                        <div className='w-[15%]'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke={`${activeNav == "viewProfile" ? "#4f41bc" : "white"}`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20.5901 22C20.5901 18.13 16.7402 15 12.0002 15C7.26015 15 3.41016 18.13 3.41016 22" stroke={`${activeNav == "viewProfile" ? "#4f41bc" : "white"}`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p>View Profile</p>
                    </button>
                </div>
            </div>
            <button onClick={useLogout()} className='flex flex-row items-center border border-lg bg-white rounded px-2 py-1 justify-center text-md font-semibold'>
                <RiLogoutBoxLine className='text-xl bg-white text-[#4f41bc]' />
                <p className=''>Log-out</p>
            </button>
        </div>

    )
}

export default SideNav