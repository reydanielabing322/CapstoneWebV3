import React, { useContext } from 'react'
import { AppContext } from '../../../utils/context'

function Dashboard({ applications }) {
    const { userData } = useContext(AppContext)

    return (
        <>
            <div className='h-full w-full flex flex-col'>
                <div className='basis-[20%] p-6 flex flex-row gap-3 items-center'>
                    <h1 className='font-black text-4xl'>{userData.dealership.name}</h1>
                    <div className='w-[10%]'>
                        <img src={userData.dealership.image} />
                    </div>

                </div>
                <div className='border border-b border-black w-full h-[1px]'></div>

                <div className='flex flex-row p-6 w-full justify-around text-center h-full'>
                    <div className='border boder-black rounded-lg w-[40%] h-[40%] flex flex-col items-center justify-center gap-2 border border-black'>
                        <p className='text-xl font-black'>Assisted Customer</p>
                        <p className='text-xl font-bold'>{applications.filter(a => a.agent == userData.id).length}</p>
                    </div>

                    <div className='border boder-black rounded-lg w-[40%] h-[40%] flex flex-col items-center justify-center gap-2 border border-black'>
                        <p className='text-xl font-black'>Waiting Customer</p>
                        <p className='text-xl font-bold'>{applications.filter(a => a.status == 'pending').length}</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard