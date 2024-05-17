import React, { useContext, useEffect, useState } from 'react'
import { axiosReq } from '../../../utils/axios'
import { AppContext } from '../../../utils/context'

function Dashboard({ listings, agents }) {
    const { userData, dealershipApplications, setDealershipApplications } = useContext(AppContext)


    useEffect(() => {
        const getDealershipApplications = async () => {
            try {
                let response = await axiosReq.get("/dealership/applications");
                setDealershipApplications(response.data.data.applications);
            } catch (error) {
                console.log(error);
            }
        }
        getDealershipApplications();
    }, [])

    return (
        <div className='h-full w-full flex flex-col'>
            <div className='basis-[20%] p-6 flex flex-row gap-3 items-center'>
                <h1 className='font-black text-4xl'>{userData.dealership.name}</h1>
                <div className='w-[10%]'>
                    <img src={userData.dealership.image} />
                </div>

            </div>
            <div className='border border-b border-black w-full h-[1px]'></div>

            <div className='flex flex-row p-6 w-full justify-around text-center'>
                <div className='border boder-black rounded-lg w-64 h-32 flex flex-col items-center justify-center gap-2'>
                    <p className='text-xl font-black'>Total Vehicles</p>
                    <p className='text-xl font-bold'>{listings.length}</p>
                </div>

                <div className='border boder-black rounded-lg w-64 h-32 flex flex-col items-center justify-center gap-2'>
                    <p className='text-xl font-black'>Agents</p>
                    <p className='text-xl font-bold'>{agents.length}</p>
                </div>

                <div className='border boder-black rounded-lg w-64 h-32 flex flex-col items-center justify-center gap-2'>
                    <p className='text-xl font-black'>Applicants</p>
                    {dealershipApplications && (
                        <p className='text-xl font-bold'>{dealershipApplications.length}</p>
                    )}
                </div>
            </div>
        </div>

    )
}

export default Dashboard