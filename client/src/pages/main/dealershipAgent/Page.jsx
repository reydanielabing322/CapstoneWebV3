import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../../utils/context.js'
import { axiosReq } from '../../../utils/axios.js';

import Profile from '../../../components/Profile.jsx';
import Spinner from '../../../components/Spinner.jsx'
import SideNav from './SideNav.jsx'
import Dashboard from './Dashboard.jsx';
import Applicants from './Applicants.jsx';

function Page() {
    const { userData, isLoading, setListings } = useContext(AppContext)
    const [activeNav, setActiveNav] = useState("dashboard");
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const getApplicants = async () => {
            const response = await axiosReq("/dealership/applications");
            const responseData = response.data.data.applications;
            setApplications(responseData);
        }
        getApplicants();

        const fetchData = async () => {
            const response = await axiosReq.get("/dealership/listings");
            setListings(response.data.data.listings)
        };
        fetchData();
    }, [])


    return (
        <>
            <div className='flex flex-row h-[100vh] bg-[#4f41bc]'>
                {isLoading && <Spinner />}
                {!userData.isapproved && (
                    <div className='fixed h-6 w-full bg-red-600 text-white flex justify-center'>
                        <p>You are not authorized by the Admin or Dealership Manager.</p>
                    </div>
                )}
                <SideNav activeNav={activeNav} setActiveNav={setActiveNav} />
                <div className='rounded-l-[20px] basis-[80%] bg-white'>
                    {activeNav == "dashboard" && (
                        <Dashboard applications={applications} />
                    )}

                    {activeNav == "applicants" && (
                        <Applicants applications={applications} setApplications={setApplications} />
                    )}


                    {activeNav == "viewProfile" && (
                        <Profile />
                    )}
                </div>
            </div >
        </>
    )
}

export default Page