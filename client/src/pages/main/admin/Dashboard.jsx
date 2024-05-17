import React from 'react'

function Dashboard({ users }) {
    return (
        <div className='h-full w-full flex flex-col'>
            <div className='basis-[20%] p-6 flex flex-col justify-between'>
                <h1 className='font-black text-2xl'>Howdy Admin</h1>
                <p className='font-bold text-xl'>Accounts</p>
            </div>
            <div className='border border-b border-black w-full h-[1px]'></div>
            <div className='flex flex-row p-6 w-full justify-center gap-32 text-center'>
                <div className='rounded-lg flex flex-col items-center justify-center gap-2 border border-black rounded-lg w-64 h-32'>
                    <p className='text-xl font-black'>Buyers</p>
                    <p className='text-xl font-bold'>{users.filter(u => u.role == 'buyer').length}</p>
                </div>
                <div className='rounded-lg flex flex-col items-center justify-center gap-2 border border-black w-64 h-32'>
                    <p className='text-xl font-black'>Dealerships</p>
                    <p className='text-xl font-bold'>{users.filter(u => u.role == 'dealershipManager').length}</p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard