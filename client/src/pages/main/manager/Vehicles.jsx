import React, { useContext, useRef, useState, useEffect } from 'react'
import { axiosReq } from '../../../utils/axios.js';
import { toast } from "react-toastify"
import { IoPencilOutline } from "react-icons/io5";
import { FaTrashCan } from "react-icons/fa6";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import CreateListing from "../../../components/CreateListing.jsx"
import { FaPlusCircle } from "react-icons/fa";
import { openModal, closeModal } from "../../../utils/functions.js"
import { AppContext } from '../../../utils/context.js';
import Spinner from '../../../components/Spinner.jsx';

function Vehicles({ listings, setListings }) {
    const { userData, isLoading, setIsLoading, dealershipApplications, setDealershipApplications } = useContext(AppContext);

    const vehicleRef = useRef(null);
    const createListingModalRef = useRef(null);
    const deleteListingModalRef = useRef(null);

    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null)

    const handleDeleteListing = async (listing) => {
        try {
            setIsLoading(true);
            await axiosReq.delete('/manager/listings', { data: { listingId: listing.id } });
            setIsLoading(false);
            closeModal(deleteListingModalRef);
            setSelectedVehicle(null);
            setListings(prevListings => prevListings.filter(l => l.id !== listing.id));
            toast.success("Successfully deleted listing");
        } catch (error) {
            setIsLoading(false);
            console.error(error)
            toast.error(error.response.data.message)
        }
    }

    const handleUpdateListingChange = (e) => {
        const { name, value } = e.target;
        setSelectedVehicle(prevState => ({
            ...prevState,
            [name]: value
        }));

    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedVehicle(prevState => ({
                ...prevState,
                image: reader.result
            }));
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    };


    const handleUpdateListing = async () => {
        try {
            setIsLoading(true);

            const formData = new FormData();

            for (const key of Object.keys(selectedVehicle)) {
                formData.append(key, selectedVehicle[key]);
            }

            var input = document.querySelector('input[name="image"]');
            if (input.files[0] != null) {
                formData.append("image", input.files[0], input.files[0].name);
                formData.append("oldImage", listings.find(l => l.id == selectedVehicle.id).image);
            }

            const response = await axiosReq.put("/manager/listings", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            const updatedListing = response.data.data.updatedListing[0];

            setListings(listings.map(l => {
                if (l.id == selectedVehicle.id) {
                    return { ...updatedListing }
                }
                return l;
            }))

            setIsLoading(false);
            setIsUpdating(false);
            toast.success("Successfully updated listing")
        } catch (error) {
            setIsLoading(false);
            console.error(error)
            toast.error(error.response.data.message)
        }
    }

    useEffect(() => {
        const getDealershipApplications = async () => {
            let response = await axiosReq.get("/dealership/applications");
            setDealershipApplications(response.data.data.applications);
        }
        getDealershipApplications();
    }, [])


    return (
        <div className='h-full w-full flex flex-col'>

            <div className='basis-[20%] p-6 flex flex-row gap-3 items-center'>
                <h1 className='font-black text-4xl'>{userData.dealership.name}</h1>
                <div className='w-[10%]'>
                    <img src={userData.dealership.image} />
                </div>
            </div>

            <div className='border border-b border-black w-full h-[1px]'></div>
            {selectedVehicle != null ? (
                <div ref={vehicleRef} className="flex flex-row justify-around h-full items-center overflow-hidden p-10">
                    <IoArrowBackCircleSharp onClick={() => { setSelectedVehicle(null); setIsUpdating(false) }} className="text-5xl text-black relative bottom-[50%] cursor-pointer text-[#414fbc]" />

                    <div className="flex items-center w-[40%]">
                        <div className="h-[400px] w-full">
                            <img src={selectedVehicle.image} className={`w-full h-full object-contain ${isUpdating && "border border-black rounded-lg"}`} />
                            {isUpdating && (
                                <>
                                    <input id="image" name="image" type="file" onChange={handleImageChange} accept="image/*" className='hidden' />
                                    <label htmlFor="image" className='relative left-[90%] bottom-[98%] cursor-pointer'><IoPencilOutline className='text-4xl' /></label>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 w-[50%] py-20">
                        <p className="text-xl font-black">Specifications</p>
                        <div className="flex flex-row gap-2 items-center text-lg justify-between">
                            <p className="font-semibold text-[#414fbc]">Model And Name</p>
                            {isUpdating == true ? (
                                <input name="modelandname" value={selectedVehicle.modelandname} onChange={handleUpdateListingChange} className='border border-black font-semibold text-right rounded-lg' required />
                            ) : (
                                <p className="font-semibold">{selectedVehicle.modelandname}</p>
                            )}
                        </div>
                        <div className="flex flex-row gap-2 items-center text-lg justify-between">
                            <p className="font-semibold text-[#414fbc]">Make</p>
                            {isUpdating == true ? (
                                <input name="make" value={selectedVehicle.make} onChange={handleUpdateListingChange} className='border border-black font-semibold text-right rounded-lg' required />
                            ) : (
                                <p className="font-semibold text-lg">{selectedVehicle.make}</p>
                            )}
                        </div>

                        <div className="flex flex-row gap-2 items-center text-lg justify-between">
                            <p className="font-semibold text-[#414fbc]">Price</p>
                            {isUpdating == true ? (
                                <input name="price" value={selectedVehicle.price} onChange={handleUpdateListingChange} className='border border-black font-semibold text-right rounded-lg' required />
                            ) : (
                                <p className="font-semibold text-lg">₱ {selectedVehicle.price}</p>
                            )}
                        </div>
                        <div className="flex flex-row gap-2 items-center text-lg justify-between">
                            <p className="font-semibold text-[#414fbc]">Power</p>
                            {isUpdating == true ? (
                                <input name="power" value={selectedVehicle.power} onChange={handleUpdateListingChange} className='border border-black font-semibold text-right rounded-lg' required />
                            ) : (
                                <p className="font-semibold text-lg">{selectedVehicle.power}</p>
                            )}
                        </div>
                        <div className="flex flex-row gap-2 items-center text-lg justify-between">
                            <p className="font-semibold text-[#414fbc]">Transmission</p>
                            {isUpdating == true ? (
                                <input name="transmission" value={selectedVehicle.transmission} onChange={handleUpdateListingChange} className='border border-black font-semibold text-right rounded-lg' required />
                            ) : (
                                <p className="font-semibold text-lg">{selectedVehicle.transmission}</p>
                            )}
                        </div>

                        <div className="flex flex-row gap-2 items-center text-lg justify-between">
                            <p className="font-semibold text-[#414fbc]">Engine</p>
                            {isUpdating == true ? (
                                <input name="engine" value={selectedVehicle.engine} onChange={handleUpdateListingChange} className='border border-black font-semibold text-right rounded-lg' required />
                            ) : (
                                <p className="font-semibold text-lg">{selectedVehicle.engine}</p>
                            )}
                        </div>

                        <div className="flex flex-row gap-2 items-center text-lg justify-between">
                            <p className="font-semibold text-[#414fbc]">Fuel Type</p>
                            {isUpdating == true ? (
                                <input name="fueltype" value={selectedVehicle.fueltype} onChange={handleUpdateListingChange} className='border border-black font-semibold text-right rounded-lg' required />
                            ) : (
                                <p className="font-semibold text-lg">{selectedVehicle.fueltype}</p>
                            )}
                        </div>

                        <div className="flex flex-row gap-2 items-center text-lg justify-between">
                            <p className="font-semibold text-[#414fbc]">Fuel Tank Capacity</p>
                            {isUpdating == true ? (
                                <input name="fueltankcapacity" value={selectedVehicle.fueltankcapacity} onChange={handleUpdateListingChange} className='border border-black font-semibold text-right rounded-lg' required />
                            ) : (
                                <p className="font-semibold text-lg">{selectedVehicle.fueltankcapacity}</p>
                            )}
                        </div>

                        <div className="flex flex-row gap-2 items-center text-lg justify-between">
                            <p className="font-semibold text-[#414fbc]">Seating Capacity</p>
                            {isUpdating == true ? (
                                <input name="seatingcapacity" value={selectedVehicle.seatingcapacity} onChange={handleUpdateListingChange} className='border border-black font-semibold text-right text-lg rounded-lg' required />
                            ) : (
                                <p className="font-semibold text-lg">{selectedVehicle.seatingcapacity}</p>
                            )}
                        </div>

                        <div className="flex flex-row gap-3 justify-center text-lg p-4">
                            <div className='w-[50%] flex justify-end'>
                                <button onClick={() => openModal(deleteListingModalRef)} className="flex flex-row gap-2 items-center px-2 py-1 rounded-lg border border-black cursor-pointer shadow-md text-red-600">
                                    <p>Remove Listing</p>
                                    <FaTrashCan className="text-xl" />
                                </button>
                            </div>
                            <div className="w-[50%] flex justify-start gap-3">
                                {isUpdating == false ? (
                                    <button onClick={() => setIsUpdating(true)} className='flex flex-row gap-2 items-center px-2 py-2 border border-black rounded-lg shadow-md text-blue-600'>
                                        <p>Update Listing</p>
                                        <IoPencilOutline className="text-xl" />
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={handleUpdateListing} className='flex flex-row gap-2 items-center px-2 py-2 border border-black rounded-lg shadow-md text-green-600'>Update</button>
                                        <button onClick={() => { setIsUpdating(false); setSelectedVehicle(listings.find(l => l.id == selectedVehicle.id)) }} className='flex flex-row gap-2 items-center px-2 py-2 border border-black rounded-lg shadow-md text-red-600'>Discard</button>
                                    </>
                                )}
                            </div>
                        </div>

                        <dialog ref={deleteListingModalRef} className={"bg-gray-100 rounded-lg"}>
                            {isLoading && <Spinner />}
                            <div className="flex flex-col gap-3 p-5">
                                <p>Are you sure you want to remove this listing?</p>
                                <div className="flex flex-row gap-2 justify-center w-full">
                                    <button onClick={() => handleDeleteListing(selectedVehicle)} className="bg-red-600 rounded-lg px-2 py-1 text-white">Yes</button>
                                    <button onClick={() => closeModal(deleteListingModalRef)} className="rounded-lg px-2 py-1 bg-[#414fbc] text-white">No</button>
                                </div>
                            </div>
                        </dialog>


                    </div>
                </div>
            ) : (
                <>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 overflow-y-auto'>
                        {listings && listings.length > 0 && (
                            listings.map(listing => (
                                <div key={listing.id} onClick={() => setSelectedVehicle(listing)} className={`cursor-pointer flex flex-col gap-2 border rounded justify-center whitespace-normal p-3 items-center shadow-md ${dealershipApplications.find(a => a.listing == listing.id && a.status == "completed") && 'border-green-600'} `}>
                                    <div className='w-[85%] h-[200px] '>
                                        <img
                                            loading="lazy"
                                            className="object-contain w-full h-full rounded"
                                            src={listing.image}
                                            alt="Listing Image"
                                        />
                                    </div>
                                    <div>
                                        <p className='text-lg font-bold'>{listing.modelandname}</p>
                                        {(dealershipApplications && dealershipApplications.filter(a => a.listing == listing.id).length > 0) && (
                                            dealershipApplications.find(a => a.listing == listing.id && a.status == "completed") ? (
                                                <>
                                                    <p className='text-sm font-light'>Vehicle released</p>
                                                </>
                                            ) : (
                                                <p className='text-sm font-light'>{dealershipApplications.filter(a => a.listing == listing.id).length} buyers applied to this listing</p>
                                            )

                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className='px-6 py-4'>
                        <button onClick={() => openModal(createListingModalRef)} className='flex flex-row gap-2 items-center bg-[#414fbc] p-2 rounded-lg text-white'>
                            <FaPlusCircle className='text-4xl cursor-pointer' />
                            <p className='font-semibold'>Create Listing</p>
                        </button>
                        <CreateListing modalRef={createListingModalRef} listings={listings} setListings={setListings} />
                    </div>
                </>
            )}

        </div>

    )
}

export default Vehicles