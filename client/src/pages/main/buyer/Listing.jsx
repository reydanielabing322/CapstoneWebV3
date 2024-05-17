import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppContext } from '../../../utils/context';
import { axiosReq } from '../../../utils/axios';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { GiPathDistance } from "react-icons/gi";
import { checkUserData, openModal, useCheckUserData, useGetApplications } from '../../../utils/functions';
import ApplyListing from '../../../components/ApplyListing';
function Listing() {
    const { userData, setUserData, setIsLoggedIn, listings, setListings, applications, setApplications } = useContext(AppContext);

    const { id } = useParams();
    const navigate = useNavigate();

    const [listing, setListing] = useState();
    const [distanceFromUser, setDistanceFromUser] = useState();
    const [application, setApplication] = useState();
    const [applicationType, setApplicationType] = useState();
    const [searchParams, setSearchParams] = useSearchParams();

    const applyListingModalRef = useRef(null);

    useEffect(() => {
        if (listing == null) return
        function success(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            const R = 6371;
            const dLat = (listing.dealership.latitude - latitude) * Math.PI / 180;
            const dLon = (listing.dealership.longitude - longitude) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(listing.dealership.latitude * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = (R * c).toFixed(2);
            setDistanceFromUser(distance)
        }

        function error(error) {
            console.error("Error getting geolocation:", error.message);
        }

        if ("geolocation" in navigator) {
            var options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };
            navigator.geolocation.getCurrentPosition(success, error, options);
        } else {
            console.error("Geolocation is not supported by this browser.");
        }

        listing.dealership.modeofpayments.forEach(mop => {
            try {
                let application = applications[mop.modeofpayment].find(a => a.listing == listing.id);
                if (application) {
                    setApplication(application);
                    setApplicationType(mop.modeofpayment);
                    return
                }
            } catch (error) {
            }
        });
    }, [listing])

    useGetApplications();

    useEffect(() => {
        const getListing = async () => {
            const l = listings.find(l => l.id == id);
            if (!l) {
                const response = await axiosReq.get(`/dealership/listings?listing_id=${id}`);
                setListings([response.data.data.listing]);
                setListing(response.data.data.listing);
            } else {
                setListing(l);
            }

        }
        getListing();

        checkUserData(searchParams, setSearchParams, setUserData, setIsLoggedIn)

        if (userData && userData.role == "buyer" && applications) {
            if (applications.length == 0) {
                setApplications(userData.applications);
            }
            const application = applications.find(a => a.listing == id);
            if (application) setApplication(application)
        }
    }, [])


    return (
        <div className='h-screen w-full p-10'>
            {listing && (
                <div className='flex flex-col w-full h-full justify-center relative'>
                    <IoArrowBackCircleSharp onClick={() => { navigate(-1) }} className="text-5xl text-black cursor-pointer text-[#414fbc] absolute top-0 left-0" />


                    <div className="flex flex-row justify-around">
                        <div className="flex items-center">
                            <div className="h-[400px] w-full">
                                <img src={listing.image} className={`w-full h-full object-contain`} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-[40%]">
                            <p className="text-xl font-black">Specifications</p>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <p className="font-semibold text-[#414fbc]">Model And Name</p>
                                <p className="font-semibold">{listing.modelandname}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center justify-between">
                                <p className="font-semibold text-[#414fbc]">Make</p>
                                <p className="font-semibold">{listing.make}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center justify-between">
                                <p className="font-semibold text-[#414fbc]">Price</p>
                                <p className="font-semibold">₱ {listing.price}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center justify-between">
                                <p className="font-semibold text-[#414fbc]">Power</p>
                                <p className="font-semibold">{listing.power}</p>
                            </div>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <p className="font-semibold text-[#414fbc]">Transmission</p>
                                <p className="font-semibold">{listing.transmission}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center justify-between">
                                <p className="font-semibold text-[#414fbc]">Engine</p>
                                <p className="font-semibold">{listing.engine}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center justify-between">
                                <p className="font-semibold text-[#414fbc]">Fuel Type</p>
                                <p className="font-semibold">{listing.fueltype}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center justify-between">
                                <p className="font-semibold text-[#414fbc]">Fuel Tank Capacity</p>
                                <p className="font-semibold">{listing.fueltankcapacity}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center justify-between">
                                <p className="font-semibold text-[#414fbc]">Seating Capacity</p>
                                <p className="font-semibold">{listing.seatingcapacity}</p>
                            </div>

                            {application ? (
                                <Link
                                    to={`/application/${application.id}`}
                                    className='text-center bg-[#414fbc] text-white px-3 py-2 rounded-lg w-full hover:text-[#414fbc] hover:bg-white border border-[#414fbc] transition-all'
                                >View Application</Link>
                            ) : (userData) && (
                                <>
                                    <ApplyListing modalRef={applyListingModalRef} listing={listing} setApplication={setApplication} setApplicationType={setApplicationType} listingId={id} />
                                    {userData.role == 'buyer' && (
                                        <button onClick={() => openModal(applyListingModalRef)} className='bg-[#414fbc] text-white px-3 py-2 rounded-lg w-full hover:text-[#414fbc] hover:bg-white border border-[#414fbc] transition-all'>Apply</button>
                                    )}
                                </>
                            )}
                        </div>

                    </div>
                    <div className='flex gap-3 w-full'>
                        <div className='w-20 h-20'>
                            <img src={listing.dealership.image} alt="" className='w-full rounded-full border border-black' />
                        </div>

                        <div className='flex flex-col justify-end gap-1 text-sm'>
                            <p className='font-bold text-xl'>{listing.dealership.name}</p>
                            <div className='flex flex-row gap-1'>
                                <FaLocationDot />
                                <p className='text-sm'>{listing.dealership.address}</p>
                            </div>
                            <div className='flex flex-row gap-1'>
                                <GiPathDistance />
                                <p className='text-sm'>Approximately {distanceFromUser == null ? "NaN" : distanceFromUser} kilometers away</p>
                            </div>
                        </div>

                        <div className='text-sm flex flex-row items-end gap-2'>
                            <p className='font-semibold'>Mode of Payments</p>

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
                                        mop.modeofpayment = "Bank Loan (Dealership Bank Choice)"
                                        break;
                                    case "bankLoan(buyerBankChoice)":
                                        mop.modeofpayment = "Bank Loan(Buyer Bank Choice)"
                                        break;
                                }

                                return (
                                    <h1 key={mop.id}>{mop.modeofpayment}</h1>
                                )
                            })}
                        </div>
                    </div>

                </div>
            )
            }
        </div >
    )
}

export default Listing