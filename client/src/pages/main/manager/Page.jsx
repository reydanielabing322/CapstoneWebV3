import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../../utils/context.js'
import { axiosReq } from '../../../utils/axios.js';
import Profile from '../../../components/Profile.jsx';
import Spinner from '../../../components/Spinner.jsx'
import SideNav from './SideNav.jsx'
import Dashboard from './Dashboard.jsx';
import Vehicles from './Vehicles.jsx';
import Agents from './Agents.jsx';

function Page() {
    const { userData, isLoading, setDealershipApplications } = useContext(AppContext)
    const [activeNav, setActiveNav] = useState("dashboard");
    const [listings, setListings] = useState([]);
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        const getDealershipData = async () => {
            try {

                let response = await axiosReq.get(`/dealership/listings?dealership_id=${userData.dealership.id}`);
                setListings(response.data.data.listings);
                response = await axiosReq.get("/agents");
                setAgents(response.data.data.agents);
                response = await axiosReq.get("/dealership/applications");
                setDealershipApplications(response.data.data.applications);
            } catch (error) {
            }
        }
        getDealershipData();
    }, [])

    return (
        <>
            {isLoading == true && <Spinner />}
            <div className='flex flex-row h-[100vh] bg-[#4f41bc]'>
                {!userData.isapproved && (
                    <div className='fixed h-6 w-full bg-red-600 text-white flex justify-center'>
                        <p>You are not authorized by the Admin.</p>
                    </div>
                )}
                <SideNav activeNav={activeNav} setActiveNav={setActiveNav} />
                <div className='rounded-l-[20px] basis-[80%] bg-white'>
                    {activeNav == "dashboard" && (
                        <Dashboard listings={listings} agents={agents} />
                    )}

                    {activeNav == "vehicles" && (
                        <Vehicles listings={listings} setListings={setListings} />
                    )}

                    {activeNav == "agents" && (
                        <Agents agents={agents} setAgents={setAgents} />
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