import React, { useContext, useEffect, useRef, useState } from 'react'
import { axiosReq } from '../../../../utils/axios';
import { AppContext } from '../../../../utils/context';
import { Link } from 'react-router-dom';
import { closeModal, handleDialogOutsideClick, openModal } from '../../../../utils/functions';
import Spinner from '../../../../components/Spinner';

function BankLoanDealershipBankChoiceApplicationProgress({ application, handleRejectApplication, handleUpdateApplication, confirmRejectApplicationModalRef }) {
    const { userData, listings, isLoading } = useContext(AppContext);
    const buyerDocumentsModalRef = useRef();
    const bankLoanCertificateModalRef = useRef();
    const [bankAgent, setBankAgent] = useState();
    const [bankAgents, setBankAgents] = useState([]);
    const bankAgentsModalRef = useRef();
    const confirmBankAgentModalRef = useRef();

    useEffect(() => {
        const getBankAgents = async () => {
            const response = await axiosReq.get("/dealership/bankagents");
            setBankAgents(response.data.data.bankagents);
        }
        getBankAgents();
    }, [])

    return (
        <div className='w-full flex flex-row gap-10 justify-center'>
            <div className='flex flex-row gap-5'>
                <div className=''>
                    <p>Applicant Name: </p>
                    <p>Address: </p>
                    <p>Phone Number: </p>
                </div>
                <div className='text-end font-bold text-md '>
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
                                    <button onClick={() => handleUpdateApplication(1, "bankLoan(dealershipBankChoice)")} className='px-2 py-1 rounded-lg border border-black'>Accept</button>
                                    <button onClick={() => openModal(confirmRejectApplicationModalRef)} className={`px-2 py-1 rounded-lg border border-black`}>Reject</button>
                                </>
                            )}
                        </td>
                    </tr>
                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 2 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 2) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
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
                                                    <button onClick={() => handleUpdateApplication(2, "bankLoan(dealershipBankChoice)")} className='px-2 py-1 rounded-lg border border-black'>Accept</button>
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
                                <p>3. Select and forward documents to Bank Agent.</p>


                                {application.progress == 2 && (
                                    <>
                                        {(application.status == "on-going" && userData.id == application.agent) && (
                                            <>
                                                <button onClick={() => openModal(bankAgentsModalRef)} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>Select</button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>


                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 4 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 4) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>4. Bank agent has accepted the application.</p>
                            </div>
                        </td>
                    </tr>


                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 5 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 5) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>5. Bank CI on progress.</p>
                            </div>
                        </td>
                    </tr>


                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 6 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 6) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>6. Bank has submitted a certificate for auto loan.</p>

                                {application.progress > 5 && (

                                    <button onClick={() => openModal(bankLoanCertificateModalRef)} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>View</button>
                                )}
                            </div>
                        </td>
                    </tr>

                    <tr className={`p-2 border flex flex-row gap-2 items-center ${application.progress >= 7 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 7) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>7. For release</p>

                                {application.progress == 6 && (
                                    <>
                                        {
                                            (application.status == "on-going" && userData.id == application.agent) && (
                                                <>
                                                    <div className='flex flex-row gap-2'>
                                                        <button onClick={() => handleUpdateApplication(7, "bankLoan(dealershipBankChoice)")} className='px-2 py-1 rounded-lg border border-black'>Release</button>
                                                    </div>

                                                    <div className='flex flex-row gap-2'>
                                                        <button onClick={() => handleRejectApplication("bankLoan(dealershipBankChoice)")} className='px-2 py-1 rounded-lg border border-black'>Reject Release</button>
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
                        <button onClick={() => handleRejectApplication("bankLoan(dealershipBankChoice)")} className='border border-black rounded-lg px-2 py-1'>Yes</button>
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

            <dialog ref={bankLoanCertificateModalRef} onClick={(e) => handleDialogOutsideClick(e, bankLoanCertificateModalRef)} className='bg-gray-100 rounded-lg'>
                <div className='flex flex-col gap-4 justify-center border p-10 text-sm font-semibold'>
                    <div className='flex flex-row gap-2'>
                        <div className='flex flex-col gap-2 w-full items-center'>
                            <p>Buyer Bank Loan Certificate</p>
                            <div className='w-[200px]'>
                                <img src={application.bankcertificate} alt="Buyer Signature" />
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>

            <dialog ref={bankAgentsModalRef} onClick={(e) => handleDialogOutsideClick(e, bankAgentsModalRef)} className='bg-gray-100 rounded-lg'>
                <div className='flex flex-col gap-4 justify-center border p-10 text-sm font-semibold'>
                    {bankAgents &&
                        (bankAgents.map(ba => (
                            <div key={ba.id} className='flex flex-row justify-between items-center px-3 py-2.5 gap-10 rounded-lg border border-black'>
                                <p>{ba.firstname}  {ba.lastname}</p>
                                <button onClick={() => { openModal(confirmBankAgentModalRef); setBankAgent(ba) }} className='px-2 py-1 bg-[#414fbc] rounded-lg border border-white text-white'>Select</button>
                            </div>
                        )
                        ))}
                </div>
            </dialog>

            <dialog ref={confirmBankAgentModalRef} onClick={(e) => handleDialogOutsideClick(e, confirmBankAgentModalRef)} className='bg-gray-100 rounded-lg'>
                {isLoading && <Spinner />}
                <div className='flex flex-col gap-3 items-center border p-10 text-sm font-semibold'>
                    <p className='text-xl font-bold'>Confirm</p>
                    <div className='flex flex-row gap-3 justify-center items-center'>
                        <button onClick={() => handleUpdateApplication(3, "bankLoan(dealershipBankChoice)", bankAgent.id)} className='py-2 px-2 py-1 bg-[#414fbc] rounded-lg border border-white text-white'>Yes</button>
                        <button className='border border-black rounded-lg px-3 py-2' onClick={() => closeModal(confirmBankAgentModalRef)}>No</button>
                    </div>
                </div>
            </dialog >

            <dialog ref={bankLoanCertificateModalRef} onClick={(e) => handleDialogOutsideClick(e, bankLoanCertificateModalRef)} className='bg-gray-100 rounded-lg'>
                <div className='flex flex-col gap-4 justify-center border p-10 text-sm font-semibold'>
                    <img src={application.loancertificate} alt="Listing Image" />
                </div>
            </dialog>
        </div >
    )
}

export default BankLoanDealershipBankChoiceApplicationProgress