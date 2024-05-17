import React from 'react'
import { Link } from "react-router-dom"

function CashApplicationProgress({ application }) {
    return (
        <div className='w-full flex flex-row'>
            <div className='flex flex-col p-5 gap-5'>
                <div>
                    <div className='flex flex-row gap-4 justify-between'>
                        <div>
                            <p className='font-bold text-md '>Applicant Name: </p>
                        </div>
                        <div className='text-end'>
                            <p className='text-end'>{application.firstname} {application.lastname}</p>
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 justify-between'>
                        <div>
                            <p className='text-end font-bold text-md '>Address: </p>
                        </div>
                        <div className='text-end'>
                            <p>{application.address}</p>
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 justify-between'>
                        <div>
                            <p className='text-end font-bold text-md '>Phone Number: </p>
                        </div>
                        <div className='text-end'>
                            <p>{application.phonenumber}</p>
                        </div>
                    </div>
                </div>

                {application.status == "completed" && (
                    <div>
                        <Link to={application.applicationpdf} target='_blank' className='px-2 py-1 rounded-lg border border-black'>View Document</Link>
                    </div>
                )}
            </div>
            <table className='border border-black w-[60%] h-max'>
                <tbody>
                    <tr className={`p-2 border border-b-black flex ${application.progress >= 1 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application
                        .progress < 1) && 'bg-red-500'} `}>
                        <td>
                            <div className='flex flex-row gap-2'>
                                <p>1. Vehicle selected</p>
                                {(application.status == "rejected" && application.progress == '0') && (
                                    <p className='text-white'>Application Rejected by agent</p>
                                )}
                            </div>
                        </td>
                    </tr>
                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 2 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 2) && 'bg-red-500'}`}>
                        <td>
                            {(application.status == "on-going") ? (
                                <>
                                    {application.progress < 2 ? (
                                        <p>2. Documents approval pending.</p>
                                    ) : (
                                        <p>2. Documents approved.</p>
                                    )}
                                </>
                            ) : (
                                <>
                                    {application.progress == 1 ? (
                                        <p className='text-white'>2. Documents rejected.</p>
                                    ) : application.progress >= 2 ? (
                                        <p>2. Documents approved.</p>
                                    ) : (
                                        <p>2. Documents approval pending.</p>
                                    )}
                                </>
                            )}
                        </td>
                    </tr>
                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 3 && 'bg-[#34F481]'} ${application.status == 'rejected' && 'bg-red-500'}`}>
                        <td>
                            {application.status == "on-going" ? (
                                <>
                                    {application.progress < 2 ? (
                                        <p>3. Payment on verification.</p>
                                    ) : (
                                        <p>3. Payment verified.</p>
                                    )}
                                </>
                            ) : (
                                <>
                                    {application.progress == 2 ? (
                                        <p className='text-white'>3. Payment rejected.</p>
                                    ) : application.progress >= 2 ? (
                                        <p>3. Payment verified.</p>
                                    ) : (
                                        <p>3. Payment on verification.</p>
                                    )}
                                </>
                            )}
                        </td>
                    </tr>
                    <tr className={`p-2 flex flex-row gap-2 items-center ${application.progress >= 4 && 'bg-[#34F481]'} ${application.status == 'rejected' && 'bg-red-500'}`}>
                        <td>
                            {(application.progress < 4) && (
                                <div className='flex flex-row gap-2 items-center'>
                                    <p>4. Unit releasing.</p>
                                </div>
                            )}
                            {(application.progress >= 4) && (
                                <p>4. Unit released.</p>
                            )}
                        </td>
                    </tr>
                </tbody>

            </table>
        </div>
    )
}

export default CashApplicationProgress