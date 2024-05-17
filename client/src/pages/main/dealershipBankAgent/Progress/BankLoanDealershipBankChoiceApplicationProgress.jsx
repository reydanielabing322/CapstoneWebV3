import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import { AppContext } from '../../../../utils/context';
import { closeModal, handleDialogOutsideClick, openModal } from '../../../../utils/functions';
import { FaTrashCan } from "react-icons/fa6";
import { MdFileUpload } from "react-icons/md";
import Spinner from '../../../../components/Spinner';

function BankLoanDealershipBankChoiceApplicationProgress({ application, handleRejectApplication, handleUpdateApplication, confirmRejectApplicationModalRef }) {
    const { userData, listings, isLoading } = useContext(AppContext);
    const buyerSelectedListingModalRef = useRef();
    const buyerDocumentsModalRef = useRef();
    const loanCertificateModalRef = useRef();
    const [certificateOfApproval, setCertificateOfApproval] = useState();
    const [fileName, setFileName] = useState();


    function handleFileChange(e) {
        const file = e.target.files[0];
        setCertificateOfApproval(file);
        setFileName(file ? truncateFileName(file.name) : "");
    }

    function truncateFileName(name) {
        if (name.length <= 20) {
            return name;
        } else {
            const halfLength = Math.ceil(20 / 2);
            const firstHalf = name.slice(0, halfLength);
            const secondHalf = name.slice(-halfLength);
            return `${firstHalf}...${secondHalf}`;
        }
    }

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
                            <Link to={`/listing/${application.listing}`} key={listings.find(l => l.id == application.listing).id} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>
                                View
                            </Link>
                        </td>
                    </tr>
                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 2 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 2) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>2. Buyer Documents.</p>

                                {application.progress > 3 && (
                                    <button onClick={() => openModal(buyerDocumentsModalRef)} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>View</button>
                                )}
                            </div>
                        </td>
                    </tr>
                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 3 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 3) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>3. Loan Application.</p>
                            </div>
                        </td>
                    </tr>


                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 4 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 4) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>4. Approve Loan Application?</p>

                                {application.progress == 3 && (
                                    <>
                                        {(application.status == "on-going" && userData.id == application.bankagent) && (
                                            <>
                                                <button onClick={() => handleUpdateApplication(4, "bankLoan(dealershipBankChoice)")} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>Yes</button>
                                                <button onClick={() => openModal(confirmRejectApplicationModalRef)} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>No</button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>


                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 5 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 5) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>5. Approve Credit Information?</p>

                                {application.progress == 4 && (
                                    <>
                                        {(application.status == "on-going" && userData.id == application.bankagent) && (
                                            <>
                                                <button onClick={() => handleUpdateApplication(5, "bankLoan(dealershipBankChoice)")} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>Yes</button>
                                                <button onClick={() => openModal(confirmRejectApplicationModalRef)} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>No</button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>


                    <tr className={`p-2 border border-b-black flex flex-row gap-2 items-center ${application.progress >= 6 && 'bg-[#34F481]'} ${(application.status == 'rejected' && application.progress < 6) && 'bg-red-500'}`}>
                        <td>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>6. Submit certificate.</p>

                                {application.progress == 5 && (
                                    <>
                                        {(application.status == "on-going" && userData.id == application.bankagent) && (
                                            <>
                                                <div className="flex flex-row items-center">
                                                    <div className='flex flex-col items-center'>
                                                        <label htmlFor="certificateOfApproval" className="bg-white flex flex-row border border-black rounded-lg px-2 py-1 cursor-pointer items-center shadow-md">
                                                            <MdFileUpload className="text-xl" />
                                                            <p>Upload Image</p>
                                                        </label>
                                                        <input
                                                            id="certificateOfApproval"
                                                            onChange={handleFileChange}
                                                            type="file"
                                                            accept="image/*"
                                                            name="certificateOfApproval"
                                                            className="hidden"
                                                        />
                                                        <p className='text-xs'>Selected file: {fileName && fileName}</p>
                                                    </div>
                                                    {certificateOfApproval != null &&
                                                        <div className='flex flex-row gap-2 items-center'>
                                                            <FaTrashCan onClick={(e) => { setFileName(""); setCertificateOfApproval(null) }} className="text-xl cursor-pointer" />
                                                            <button onClick={() => handleUpdateApplication(6, "bankLoan(dealershipBankChoice)", null, certificateOfApproval)} className='text-xs py-3 py-2 border border-black bg-[#414fbc] rounded-lg text-white'>Submit</button>
                                                        </div>
                                                    }
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {application.progress > 5 && (

                                    <button onClick={() => openModal(loanCertificateModalRef)} className='px-2 py-1 rounded-lg border border-black bg-gray-200'>View</button>
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
                                                        <button onClick={() => handleUpdateApplication(4, "bankLoan(dealershipBankChoice)")} className='px-2 py-1 rounded-lg border border-black'>Release</button>
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

            <dialog ref={buyerSelectedListingModalRef} onClick={(e) => handleDialogOutsideClick(e, buyerSelectedListingModalRef)} className='bg-gray-100 rounded-lg'>
                <div className='flex flex-col gap-4 justify-center border p-10 text-sm font-semibold'>
                    <img src={listings.find(l => l.id == application.listing).image} alt="Listing Image" />
                </div>
            </dialog>

            <dialog ref={loanCertificateModalRef} onClick={(e) => handleDialogOutsideClick(e, loanCertificateModalRef)} className='bg-gray-100 rounded-lg'>
                <div className='flex flex-col gap-4 justify-center border p-10 text-sm font-semibold'>
                    <img src={application.loancertificate} alt="Listing Image" />
                </div>
            </dialog>

        </div >
    )
}

export default BankLoanDealershipBankChoiceApplicationProgress