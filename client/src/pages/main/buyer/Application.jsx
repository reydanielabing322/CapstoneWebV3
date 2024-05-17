import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom';
import { AppContext } from '../../../utils/context';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useGetApplications } from '../../../utils/functions';
import BankLoanBuyerBankChoiceApplicationProgress from './Progress/BankLoanBuyerBankChoiceApplicationProgress';
import CashApplicationProgress from './Progress/CashApplicationProgress';
import InhouseFinanceApplicationProgress from './Progress/InhouseFinanceApplicationProgress';
import BankLoanDealershipBankChoiceApplicationProgress from './Progress/BankLoanDealershipBankChoiceApplicationProgress';

function Application() {
    const { listings, applications } = useContext(AppContext);
    const { id } = useParams();
    const [listing, setListing] = useState();
    const [application, setApplication] = useState();
    const navigate = useNavigate();

    useGetApplications();
    useEffect(() => {
        const application = applications.find(a => a.id == id);
        setListing(listings.find(l => l.id == application.listing));
        setApplication(application);
    }, [applications]);

    return (
        <div className='h-screen w-full p-10'>
            <div className='flex flex-row w-full h-full justify-center relative'>
                <IoArrowBackCircleSharp onClick={() => { navigate(-1) }} className="text-5xl text-black cursor-pointer text-[#414fbc]" />

                <div className="flex flex-row w-full">
                    {(application && application.applicationType == "cash") && (
                        <div className='w-[60%] flex flex-col justify-center'>
                            <CashApplicationProgress application={application} />
                        </div>
                    )}

                    {(application && application.applicationType == "inhouseFinance") && (
                        <div className='w-[60%] flex flex-col justify-center'>
                            <InhouseFinanceApplicationProgress application={application} />
                        </div>
                    )}

                    {(application && application.applicationType == "bankLoan(buyerBankChoice)") && (
                        <div className='w-[60%] flex flex-col justify-center'>
                            <BankLoanBuyerBankChoiceApplicationProgress application={application} />
                        </div>
                    )}

                    {(application && application.applicationType == "bankLoan(dealershipBankChoice)") && (
                        <div className='w-[60%] flex flex-col justify-center'>
                            <BankLoanDealershipBankChoiceApplicationProgress application={application} />
                        </div>
                    )}


                    {listing && (
                        <div className="flex flex-col w-[40%] h-full justify-center items-center p-5">
                            <div className="h-[300px] w-full">
                                <img src={listing.image} className={`w-full h-full object-contain`} />
                            </div>
                            <div className='flex flex-col gap-2 text-md w-[80%]'>
                                <p className=" font-black text-xl">Specifications</p>
                                <div className="flex flex-row gap-2 items-center  justify-between">
                                    <p className="font-semibold text-[#414fbc]">Model And Name</p>
                                    <p className="font-semibold">{listing.modelandname}</p>
                                </div>
                                <div className="flex flex-row gap-2 items-center  justify-between">
                                    <p className="font-semibold text-[#414fbc]">Make</p>
                                    <p className="font-semibold ">{listing.make}</p>
                                </div>

                                <div className="flex flex-row gap-2 items-center  justify-between">
                                    <p className="font-semibold text-[#414fbc]">Price</p>
                                    <p className="font-semibold ">₱ {listing.price}</p>
                                </div>
                                <div className="flex flex-row gap-2 items-center  justify-between">
                                    <p className="font-semibold text-[#414fbc]">Power</p>
                                    <p className="font-semibold ">{listing.power}</p>
                                </div>
                                <div className="flex flex-row gap-2 items-center  justify-between">
                                    <p className="font-semibold text-[#414fbc]">Transmission</p>
                                    <p className="font-semibold ">{listing.transmission}</p>
                                </div>

                                <div className="flex flex-row gap-2 items-center  justify-between">
                                    <p className="font-semibold text-[#414fbc]">Engine</p>
                                    <p className="font-semibold ">{listing.engine}</p>
                                </div>

                                <div className="flex flex-row gap-2 items-center  justify-between">
                                    <p className="font-semibold text-[#414fbc]">Fuel Type</p>
                                    <p className="font-semibold ">{listing.fueltype}</p>
                                </div>

                                <div className="flex flex-row gap-2 items-center  justify-between">
                                    <p className="font-semibold text-[#414fbc]">Fuel Tank Capacity</p>
                                    <p className="font-semibold ">{listing.fueltankcapacity}</p>
                                </div>

                                <div className="flex flex-row gap-2 items-center  justify-between">
                                    <p className="font-semibold text-[#414fbc]">Seating Capacity</p>
                                    <p className="font-semibold ">{listing.seatingcapacity}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Application