import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../../../utils/context';
import { Link } from 'react-router-dom';
import { handleDialogOutsideClick, openModal } from '../../../../utils/functions';

function BankLoanDealershipBankChoiceApplicationProgress({ application }) {
    const { listings } = useContext(AppContext);
    const bankLoanCertificateModalRef = useRef();
    const buyerDocumentsModalRef = useRef();

    return (
        <>
            <div className='w-full flex flex-row gap-10 justify-center'>
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
                        <tr className={`p-2 border border-b-black flex ${application.progress >= 1 && 'bg-[#34F481]'}`}>
                            <td className='flex flex-row gap-2 items-center'>
                                <p>1. Buyer selected vehicle</p>
                            </td>
                        </tr>
                        <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 2 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 2) && 'bg-red-500'}`}>
                            <td>
                                <div className='flex flex-row gap-2 items-center'>
                                    <p>2. Documents.</p>
                                    {/* <button onClick={() => openModal(buyerDocumentsModalRef)} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>View</button> */}
                                </div>
                            </td>
                        </tr>
                        <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 3 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 3) && 'bg-red-500'}`}>
                            <td>
                                <div className='flex flex-row gap-2 items-center'>
                                    <p>3. Bank Loan via Dealership Partners.</p>
                                </div>
                            </td>
                        </tr>


                        <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 4 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 4) && 'bg-red-500'}`}>
                            <td>
                                <div className='flex flex-row gap-2 items-center'>
                                    <p>4. Bank has approved your application.</p>
                                </div>
                            </td>
                        </tr>


                        <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 5 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 5) && 'bg-red-500'}`}>
                            <td>
                                <div className='flex flex-row gap-2 items-center'>
                                    <p>5. Bank Credit Investigation.</p>
                                </div>
                            </td>
                        </tr>


                        <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 6 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 6) && 'bg-red-500'}`}>
                            <td>
                                <div className='flex flex-row gap-2 items-center'>
                                    <p>6. Bank has submitted a certificate for auto loan.</p>

                                    {/* {application.progress > 5 && (
                                        <button onClick={() => openModal(bankLoanCertificateModalRef)} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>View</button>
                                    )} */}
                                </div>
                            </td>
                        </tr>

                        <tr className={`p-2 border flex flex-row gap-2 items-center ${application.progress >= 7 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 7) && 'bg-red-500'}`}>
                            <td>
                                <div className='flex flex-row gap-2 items-center'>
                                    <p>7. For release</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table >

            </div>



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
                    <img src={application.loancertificate} alt="Listing Image" />
                </div>
            </dialog>
        </>
    )
}

export default BankLoanDealershipBankChoiceApplicationProgress