import React, { useState, useContext, useEffect } from "react";
import { axiosReq } from "../utils/axios";
import { toast } from "react-toastify";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaTrashCan } from "react-icons/fa6";
import { MdFileUpload } from "react-icons/md";
import { closeModal, handleDialogOutsideClick } from "../utils/functions";
import Spinner from "./Spinner";

export default function CreateListing({
    modalRef,
    listings,
    setListings
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [listingImage, setListingImage] = useState(null);
    const [fileName, setFileName] = useState();

    const handleCreateListing = async (e) => {
        try {
            e.preventDefault()
            setIsLoading(true);

            const formData = new FormData();

            for (const element of e.target.elements) {
                if (element.name && element.value) {
                    formData.append(element.name, element.value);
                }
            }

            formData.append("listingImage", listingImage);
            const response = await axiosReq.post("/manager/listings", formData);
            const newListing = response.data.data.newListing;
            console.log(newListing);

            setListings(listings => [...listings, ...newListing]);
            setIsLoading(false);
            e.target.reset();
            closeModal(modalRef);
            toast.success("Successfully created listing")
        } catch (error) {
            setIsLoading(false);
            console.error(error)
            toast.error(error.response.data.message)
        }
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
        <dialog
            ref={modalRef}
            onClick={(e) => handleDialogOutsideClick(e, modalRef)}
            className={"bg-gray-100 rounded-lg"}
        >
            {isLoading == true && <Spinner></Spinner>}
            <form onSubmit={handleCreateListing} className="flex flex-col gap-4 justify-center border p-10 px-14" encType="multipart/form-data">
                <button onClick={() => closeModal(modalRef)} type="button" className="absolute top-5 right-5 text-4xl">
                    <IoIosCloseCircleOutline />
                </button>
                <p className="text-xl font-bold">Create Listing</p>

                <div className="flex flex-row gap-2">
                    <div className="relative w-full min-w-[200px] h-10">
                        <input name="modelAndName" required
                            className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow"
                            placeholder=" " /><label
                                className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Model And Name
                        </label>
                    </div>

                    <div className="relative w-full min-w-[200px] h-10">
                        <input name="make" required
                            className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow"
                            placeholder=" " /><label
                                className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Make
                        </label>
                    </div>
                </div>
                <div className="relative w-full min-w-[200px] h-10">
                    <input name="power" required
                        className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow"
                        placeholder=" " /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Power
                    </label>
                </div>

                <div className="relative w-full min-w-[200px] h-10">
                    <input name="transmission" required
                        className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow"
                        placeholder=" " /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Transmission
                    </label>
                </div>

                <div className="relative w-full min-w-[200px] h-10">
                    <input name="engine" required
                        className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow"
                        placeholder=" " /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Engine
                    </label>
                </div>

                <div className="flex flex-row gap-2">
                    <div className="relative w-full min-w-[200px] h-10">
                        <input name="fuelType" required
                            className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow"
                            placeholder=" " /><label
                                className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Fuel Type
                        </label>
                    </div>

                    <div className="relative w-full min-w-[200px] h-10">
                        <input name="fuelTankCapacity" required
                            className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow"
                            placeholder=" " /><label
                                className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Fuel Tank Capacity
                        </label>
                    </div>
                </div>

                <div className="relative w-full min-w-[200px] h-10">
                    <input name="seatingCapacity" required
                        className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow"
                        placeholder=" " /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Seating Capacity
                    </label>
                </div>

                <div className="relative w-full min-w-[200px] h-10">
                    <input name="price" required
                        className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow"
                        placeholder=" " /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Price
                    </label>
                </div>

                <div className="relative w-full min-w-[200px] h-10">
                    <input name="vehicleType" required
                        className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow"
                        placeholder=" " /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Vehicle Type
                    </label>
                </div>


                <div className="flex flex-row gap-2 items-center">
                    <label htmlFor="listingImage" className="bg-white flex flex-row border border-black rounded-lg px-2 py-1 cursor-pointer items-center">
                        <MdFileUpload className="text-xl" />
                        <p>Upload Image</p>
                    </label>

                    <input
                        id="listingImage"
                        onChange={(e) => { setListingImage(e.target.files[0]); const file = e.target.files[0]; setFileName(file ? truncateFileName(file.name) : ""); }}
                        type="file"
                        accept="image/*"
                        name="listinImage"
                        className="px-2 py-1 border border-black rounded w-full hidden"
                        required
                    />
                    <p>Selected file: {fileName && fileName}</p>
                    {listingImage != null &&
                        <FaTrashCan onClick={(e) => { setFileName(""); setListingImage(null) }} className="text-xl cursor-pointer" />
                    }
                </div>



                <button type="submit" className="bg-[#4f41bc] px-3 py-2 rounded-lg text-white">Submit</button>
            </form>
        </dialog>
    );
}