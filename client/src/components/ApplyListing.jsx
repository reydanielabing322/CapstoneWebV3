import React, { useContext, useEffect, useState } from 'react'
import { axiosReq } from "../utils/axios";
import { toast } from "react-toastify"
import { AppContext } from '../utils/context';
import { closeModal, handleDialogOutsideClick } from '../utils/functions';
import Spinner from './Spinner';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { MdFileUpload } from "react-icons/md";
import { FaTrashCan } from "react-icons/fa6";

function ApplyListing({ modalRef, listing, setApplication, listingId }) {
    const { isLoading, setIsLoading, setApplications } = useContext(AppContext);
    const [modeOfPayment, setModeOfPayment] = useState();
    const [cashModeOfPayment, setCashModeOfPayment] = useState();
    const [validId, setValidId] = useState(null);
    const [validIdFileName, setValidIdFileName] = useState();
    const [signature, setSignature] = useState();
    const [signatureFileName, setSignatureFileName] = useState();

    const [coMakerValidId, setCoMakerValidId] = useState();
    const [coMakerValidIdFileName, setCoMakerValidIdFileName] = useState();
    const [coMakerSignature, setCoMakerSignature] = useState();
    const [coMakerSignatureFileName, setCoMakerSignatureFileName] = useState();
    const [bankLoanCertificate, setBankLoanCertificate] = useState();
    const [bankLoanCertificateFileName, setBankLoanCertificateFileName] = useState();

    function handleFileChange(e) {
        const file = e.target.files[0];
        const inputName = e.target.name;
        switch (inputName) {
            case "validId":
                setValidId(file);
                setValidIdFileName(file ? truncateFileName(file.name) : "");
                break;
            case "signature":
                setSignature(file);
                setSignatureFileName(file ? truncateFileName(file.name) : "");
                break;
            case "coMakerValidId":
                setCoMakerValidId(file);
                setCoMakerValidIdFileName(file ? truncateFileName(file.name) : "");
                break;
            case "coMakerSignature":
                setCoMakerSignature(file);
                setCoMakerSignatureFileName(file ? truncateFileName(file.name) : "");
                break;
            case "bankLoanCertificate":
                setBankLoanCertificate(file);
                setBankLoanCertificateFileName(file ? truncateFileName(file.name) : "");
                break;
        }
    }

    function truncateFileName(name) {
        if (name.length <= 10) {
            return name;
        } else {
            const halfLength = Math.ceil(10 / 2);
            const firstHalf = name.slice(0, halfLength);
            const secondHalf = name.slice(-halfLength);
            return `${firstHalf}...${secondHalf}`;
        }
    }


    const handleCreateApplication = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);

            let formData = new FormData();

            for (const element of e.target.elements) {
                if (element.name && element.value) {
                    formData.set(element.name, element.value);
                }
            }

            formData.set("listingId", listingId);
            formData.set("signature", signature);
            formData.set("validId", validId);
            formData.set("coMakerSignature", coMakerSignature);
            formData.set("coMakerValidId", coMakerValidId);
            formData.set("bankLoanCertificate", bankLoanCertificate);

            // for (const pair of formData.entries()) {
            //     console.log(pair[0], pair[1]);
            // }

            const response = await axiosReq.post("/buyer/listings/apply", formData);
            const newApplication = response.data.data.application;
            newApplication.applicationType = modeOfPayment;

            setApplication(newApplication);
            setApplications(prev => [...prev, newApplication]);
            toast.success("Successfully applied to listing");
        } catch (error) {
            console.error(error)
            toast.error(error.response.data.message)
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <dialog
            ref={modalRef}
            onClick={(e) => handleDialogOutsideClick(e, modalRef)}
            className={"bg-gray-100 rounded-lg"}
        >
            {isLoading == true && <Spinner></Spinner>}
            <form onSubmit={handleCreateApplication} className="flex flex-col gap-4 justify-center border p-10 text-sm" encType="multipart/form-data">
                <button onClick={() => closeModal(modalRef)} type="button" className="absolute top-5 right-5 text-4xl">
                    <IoIosCloseCircleOutline />
                </button>

                <p className="text-xl font-bold">Apply Listing</p>
                <div className='flex flex-row gap-2'>
                    <div className="relative w-full min-w-[200px] h-10">
                        <input name="firstName"
                            className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                            placeholder=" " /><label
                                className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">First Name
                        </label>
                    </div>
                    <div className="relative w-full min-w-[200px] h-10">
                        <input name="lastName"
                            className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                            placeholder=" " /><label
                                className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Last Name
                        </label>
                    </div>
                </div>

                <div className="relative w-full min-w-[200px] h-10">
                    <input name="address"
                        className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                        placeholder=" " /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Address
                    </label>
                </div>

                <div className="relative w-full min-w-[200px] h-10">
                    <input name="phoneNumber"
                        className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                        placeholder=" " /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Phone Number
                    </label>
                </div>
                <div className='flex flex-row gap-3 justify-between'>
                    <div className='flex flex-col gap-2 w-1/2'>
                        <p className='font-semibold text-base'>Valid ID</p>
                        <div className="flex flex-row gap-2 items-center">
                            <label htmlFor="validId" className="bg-white flex flex-row border border-black rounded-lg px-2 py-1 cursor-pointer items-center shadow-md">
                                <MdFileUpload className="text-xl" />
                                <p>Upload Image</p>
                            </label>
                            <input
                                id="validId"
                                onChange={handleFileChange}
                                type="file"
                                accept="image/*"
                                name="validId"
                                className="px-2 py-1 border border-black rounded w-full hidden"
                            />

                            {validId && (
                                <>
                                    <p>Selected: {validIdFileName}</p>
                                    <FaTrashCan onClick={(e) => { setValidIdFileName(""); setValidId(null) }} className="text-xl cursor-pointer" />
                                </>
                            )}
                        </div>
                    </div>

                    <div className='flex flex-col gap-2 w-1/2'>
                        <p className='font-semibold text-base'>Signature</p>
                        <div className="flex flex-row gap-2 items-center">
                            <label htmlFor="signature" className="bg-white flex flex-row border border-black rounded-lg px-2 py-1 cursor-pointer items-center shadow-md">
                                <MdFileUpload className="text-xl" />
                                <p>Upload Image</p>
                            </label>
                            <input
                                id="signature"
                                onChange={handleFileChange}
                                type="file"
                                accept="image/*"
                                name="signature"
                                className="px-2 py-1 border border-black rounded w-full hidden"
                            />
                            {signature && (
                                <>
                                    <p>Selected: {signatureFileName}</p>
                                    <FaTrashCan onClick={(e) => { setSignatureFileName(""); setSignature(null) }} className="text-xl cursor-pointer" />
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {modeOfPayment == "bankLoan(buyerBankChoice)" && (
                    <>
                        <div className='flex flex-col gap-2 w-1/2'>
                            <p className='font-semibold text-base'>Bank Loan Certificate</p>
                            <div className="flex flex-row gap-2 items-center">
                                <label htmlFor="bankLoanCertificate" className="bg-white flex flex-row border border-black rounded-lg px-2 py-1 cursor-pointer items-center shadow-md">
                                    <MdFileUpload className="text-xl" />
                                    <p>Upload Image</p>
                                </label>
                                <input
                                    id="bankLoanCertificate"
                                    onChange={handleFileChange}
                                    type="file"
                                    accept="image/*"
                                    name="bankLoanCertificate"
                                    className="px-2 py-1 border border-black rounded w-full hidden"
                                />
                                {bankLoanCertificate && (
                                    <>
                                        <p>Selected: {bankLoanCertificateFileName}</p>
                                        <FaTrashCan onClick={(e) => { setBankLoanCertificateFileName(""); setBankLoanCertificate(null) }} className="text-xl cursor-pointer" />
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {modeOfPayment == "inhouseFinance" && (
                    <>
                        <div className='flex flex-row gap-3'>
                            <div className="relative w-full min-w-[200px] h-10">
                                <input name="coMakerFirstName"
                                    className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                                    placeholder=" " /><label
                                        className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Co Maker First Name
                                </label>
                            </div>
                            <div className="relative w-full min-w-[200px] h-10">
                                <input name="coMakerLastName"
                                    className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                                    placeholder=" " /><label
                                        className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Co Maker Last Name
                                </label>
                            </div>
                        </div>

                        <div className="relative w-full min-w-[200px] h-10">
                            <input name="coMakerAddress"
                                className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                                placeholder=" " /><label
                                    className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Co Maker Address
                            </label>
                        </div>

                        <div className="relative w-full min-w-[200px] h-10">
                            <input name="coMakerPhoneNumber"
                                className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                                placeholder=" " /><label
                                    className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Co Maker Phone Number
                            </label>
                        </div>

                        <div className='flex flex-row gap-2'>
                            <div className='flex flex-col gap-2 w-1/2'>
                                <p className='font-semibold text-base'>Co Maker Valid ID</p>
                                <div className="flex flex-row gap-2 items-center">
                                    <label htmlFor="coMakerValidId" className="bg-white flex flex-row border border-black rounded-lg px-2 py-1 cursor-pointer items-center shadow-md">
                                        <MdFileUpload className="text-xl" />
                                        <p>Upload Image</p>
                                    </label>
                                    <input
                                        id="coMakerValidId"
                                        onChange={handleFileChange}
                                        type="file"
                                        accept="image/*"
                                        name="coMakerValidId"
                                        className="px-2 py-1 border border-black rounded w-full hidden"
                                    />

                                    {coMakerValidId && (
                                        <>
                                            <p>Selected: {coMakerValidIdFileName}</p>
                                            <FaTrashCan onClick={(e) => { setCoMakerValidIdFileName(""); setCoMakerValidId(null) }} className="text-xl cursor-pointer" />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className='flex flex-col gap-2 w-1/2'>
                                <p className='font-semibold text-base'>Co Maker Signature</p>
                                <div className="flex flex-row gap-2 items-center">
                                    <label htmlFor="coMakerSignature" className="bg-white flex flex-row border border-black rounded-lg px-2 py-1 cursor-pointer items-center shadow-md">
                                        <MdFileUpload className="text-xl" />
                                        <p>Upload Image</p>
                                    </label>
                                    <input
                                        id="coMakerSignature"
                                        onChange={handleFileChange}
                                        type="file"
                                        accept="image/*"
                                        name="coMakerSignature"
                                        className="px-2 py-1 border border-black rounded w-full hidden"
                                    />

                                    {coMakerSignature && (
                                        <>
                                            <p>Selected: {coMakerSignatureFileName}</p>
                                            <FaTrashCan onClick={(e) => { setCoMakerSignatureFileName(""); setCoMakerSignature(null) }} className="text-xl cursor-pointer" />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className='flex flex-col gap-1'>
                    <label className='text-base font-semibold'>Available Mode of Payments: </label>
                    <select name="modeofpayment" onChange={(e) => setModeOfPayment(e.target.value)} className='px-3 py-2.5 text-sm rounded-lg border border-black shadow-md'>
                        <option value="">Select</option>
                        {listing.dealership.modeofpayments.map(e => {
                            let mop = { ...e };
                            switch (mop.modeofpayment) {
                                case "cash":
                                    mop.modeofpayment = "Cash"
                                    break;
                                case "cheque":
                                    mop.modeofpayment = "Cheque";
                                    break
                                case "inhouseFinance":
                                    mop.modeofpayment = "Inhouse Finance"
                                    break;
                                case "bankLoan(dealershipBankChoice)":
                                    mop.modeofpayment = "Bank Loan(Dealership Bank Choice)"
                                    break;
                                case "bankLoan(buyerBankChoice)":
                                    mop.modeofpayment = "Bank Loan(Buyer Bank Choice)"
                                    break;
                            }
                            return (
                                <option key={e.id} value={e.modeofpayment}>{mop.modeofpayment}</option>
                            )
                        })}
                    </select>

                    {modeOfPayment == "cash" && (
                        <>
                            <p className='text-base font-semibold'>Cash Mode of Payment</p>
                            <div className='flex flex-row justify-around gap-2 rounded-lg border border-black px-3 py-2.5 shadow-md bg-white'>
                                <label className='flex flex-row gap-2 items-center'>
                                    <input type="radio" name="cashmodeofpayment" onChange={() => setCashModeOfPayment("overthecounter")} checked={cashModeOfPayment == 'overthecounter'} value={cashModeOfPayment} />
                                    <p>Over the Counter</p>
                                </label>
                                <label className='flex flex-row gap-2 items-center'>
                                    <input type="radio" name="cashmodeofpayment" onChange={() => setCashModeOfPayment("chequeondelivery")} checked={cashModeOfPayment == 'chequeondelivery'} value={cashModeOfPayment} />
                                    <p>Cheque on Delivery</p>
                                </label>
                            </div>
                        </>
                    )}
                </div>

                <button type="submit" disabled={(modeOfPayment == "")} className='bg-[#4f41bc] px-3 py-2 rounded-lg text-white disabled:cursor-pointer'>Submit</button>
            </form>
        </dialog>

    )
}

export default ApplyListing