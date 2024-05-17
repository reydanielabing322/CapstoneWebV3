import React, { useContext, useRef } from 'react'
import { AppContext } from '../../../../utils/context';
import { Link } from 'react-router-dom';
import { closeModal, handleDialogOutsideClick, openModal } from '../../../../utils/functions';
import Spinner from '../../../../components/Spinner';

function CashApplicationProgress({ application, handleRejectApplication, handleUpdateApplication, confirmRejectApplicationModalRef }) {
    const { userData, listings, isLoading } = useContext(AppContext);
    const buyerDocumentsModalRef = useRef();

    return (
        <div className='w-full flex flex-row gap-10 justify-center'>
            <div className='flex flex-row gap-5'>
                <div>
                    <p>Applicant Name: </p>
                    <p>Address: </p>
                    <p>Phone Number: </p>
                </div>
                <div className='text-end font-bold text-md'>
                    <p>{application.firstname} {application.lastname}</p>
                    <p>{application.address}</p>
                    <p>{application.phonenumber}</p>
                </div>
            </div>
            <table className='border border-black'>
                <tbody>
                    <tr className={`p-2 border border-b-black flex ${application.progress >= 1 && 'bg-[#34F481]'}`}>
                        <td className='flex flex-row gap-2 items-center'>
                            <p>1. Buyer selected vehicle</p>
                            <Link to={`/listing/${listings.find(l => l.id == application.listing).id}`} key={listings.find(l => l.id == application.listing).id} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>
                                View
                            </Link>
                            {application.progress == 0 && (
                                <>
                                    <button onClick={() => handleUpdateApplication(1, "cash")} className='px-2 py-1 rounded-lg border border-black'>Accept</button>
                                    <button onClick={() => openModal(confirmRejectApplicationModalRef)} className={`px-2 py-1 rounded-lg border border-black`}>Reject</button>
                                </>
                            )}
                        </td>
                    </tr>
                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 2 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 2) && 'bg-red-500'}`}>
                        <td>
                            < div className='flex flex-row gap-2 items-center'>
                                <p>2. Buyer Documents.</p>
                                <button onClick={() => openModal(buyerDocumentsModalRef)} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>View</button>

                                {application.progress == 1 && (
                                    <>
                                        {(application.status == "rejected" && application.progress == '1') && (
                                            <p className='text-white'>Buyer Documents Rejected</p>
                                        )}
                                        {(application.status == "on-going" && userData.id == application.agent) && (
                                            <>
                                                <div className='flex flex-row gap-2'>
                                                    <button onClick={() => handleUpdateApplication(2, "cash")} className='px-2 py-1 rounded-lg border border-black'>Accept</button>
                                                    <button onClick={() => openModal(confirmRejectApplicationModalRef)} className={`px-2 py-1 rounded-lg border border-black`}>Reject</button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 3 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 3) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>3. Verify Payment.</p>

                                {application.progress == 2 && (
                                    < div className='flex flex-row gap-2 items-center'>
                                        {(application.status == "rejected" && application.progress == '2') && (
                                            <p className='text-white'>Payment Rejected</p>
                                        )}
                                        {(application.status == "on-going" && userData.id == application.agent) && (
                                            <>
                                                <div className='flex flex-row gap-2'>
                                                    <button onClick={() => handleUpdateApplication(3, "cash")} className='px-2 py-1 rounded-lg border border-black'>Accept</button>
                                                    <button onClick={() => openModal(confirmRejectApplicationModalRef)} className={`px-2 py-1 rounded-lg border border-black`}>Reject</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </td>
                    </tr>
                    <tr className={`p-2 flex flex-row gap-2 items-center ${application.progress >= 4 && 'bg-[#34F481]'} ${application.status == 'rejected' && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>4. For release</p>

                                {application.progress == 3 && (
                                    <>
                                        {
                                            (application.status == "on-going" && userData.id == application.agent) && (
                                                <>
                                                    <div className='flex flex-row gap-2'>
                                                        <button onClick={() => handleUpdateApplication(4, "cash")} className='px-2 py-1 rounded-lg border border-black'>Release</button>
                                                    </div>

                                                    <div className='flex flex-row gap-2'>
                                                        <button onClick={() => handleRejectApplication("cash")} className='px-2 py-1 rounded-lg border border-black'>Reject Release</button>
                                                    </div>
                                                </>
                                            )
                                        }
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table >

            <dialog ref={confirmRejectApplicationModalRef} className='bg-gray-100 rounded-lg'>
                {isLoading && <Spinner />}
                <div className='flex flex-col gap-4 justify-center border p-10 text-sm'>
                    <h1 className='font-semibold text-sm'>Are you sure you want to reject this application?</h1>
                    <div className='flex flex-row gap-4 font-semibold w-full justify-center items-center'>
                        <button onClick={() => handleRejectApplication("cash")} className='border border-black rounded-lg px-2 py-1'>Yes</button>
                        <button className='border border-black rounded-lg px-2 py-1' onClick={() => closeModal(confirmRejectApplicationModalRef)}>No</button>
                    </div>
                </div>
            </dialog>

            <dialog ref={buyerDocumentsModalRef} onClick={(e) => handleDialogOutsideClick(e, buyerDocumentsModalRef)} className='bg-gray-100 rounded-lg'>
                <div className='flex flex-col gap-4 justify-center border p-10 text-sm font-semibold'>
                    <div className='flex flex-row gap-2'>
                        <div className='flex flex-col gap-2 w-full items-center'>
                            <p>Buyer Signature</p>
                            <div className='w-[200px]'>
                                <img src={application.signature} alt="Buyer Signature" />
                            </div>
                        </div>
                        <div className='flex flex-col gap-2 w-full items-center'>
                            <p>Buyer Valid ID</p>
                            <div className='w-[200px]'>
                                <img src={application.validid} alt="Buyer Valid ID" />
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>
        </div>
    )
}

export default CashApplicationProgress