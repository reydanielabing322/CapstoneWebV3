import { useContext, useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { closeModal, handleDialogOutsideClick } from "../utils/functions";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaTrashCan } from "react-icons/fa6";
import { MdFileUpload } from "react-icons/md";
import Spinner from "./Spinner";
import { axiosReq } from "../utils/axios";
import { AppContext } from "../utils/context";
export default function UpdateProfile({
    modalRef
}) {
    const { setUserData } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [fileName, setFileName] = useState();

    async function handleUpdateProfile(e) {
        try {
            e.preventDefault();
            setIsLoading(true);
            const formData = new FormData();
            for (const element of e.target.elements) {
                if (element.name && element.value) {
                    formData.append(element.name, element.value)
                }
            }
            if (profileImage)
                formData.append("profileImage", profileImage);
            const response = await axiosReq.put("/user/profile", formData);
            const newUserData = response.data.data.user;

            Cookies.set("api_access_token", response.data.data.token);
            Cookies.set("access_token", response.data.data.access_token);

            setUserData(newUserData);
            setFileName("");
            setProfileImage("");
            e.target.reset();
            setProfileImage(null);
            closeModal(modalRef);
            setIsLoading(false);
            toast.success("Successfully updated profile");
        } catch (error) {
            setIsLoading(false);
            console.error(error);
            toast.error(error.response.data.message);
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        setProfileImage(file);
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
        <dialog ref={modalRef} onClick={(e) => handleDialogOutsideClick(e, modalRef)} className="bg-gray-100 rounded-lg">
            {isLoading && <Spinner></Spinner>}
            <form onSubmit={(e) => handleUpdateProfile(e)} className='flex flex-col gap-4 justify-center border p-10 text-sm' encType="multipart/form-data">
                <button onClick={() => closeModal(modalRef)} type="button" className="absolute top-3 right-3 text-4xl">
                    <IoIosCloseCircleOutline />
                </button>

                <h1 className='font-bold text-xl text-center'>Update Profile</h1>
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
                <div className='flex flex-row gap-2 items-center'>
                    <label htmlFor="gender" className='text-md font-semibold'>Gender: </label>
                    <select name="gender" className='px-2 py-1 border border-black rounded'>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Others</option>
                    </select>
                </div>
                <div className="relative w-full min-w-[200px] h-10">
                    <input name="phoneNumber"
                        className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                        placeholder=" " /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Phone Number
                    </label>
                </div>
                <div className="relative w-full min-w-[200px] h-10">
                    <input name="address"
                        className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                        placeholder=" " /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Address
                    </label>
                </div>

                <div className="flex flex-row gap-2 items-center">
                    <label htmlFor="profileImage" className="bg-white flex flex-row border border-black rounded-lg px-2 py-1 cursor-pointer items-center shadow-md">
                        <MdFileUpload className="text-xl" />
                        <p>Upload Image</p>
                    </label>
                    <input
                        id="profileImage"
                        onChange={handleFileChange}
                        type="file"
                        accept="image/*"
                        name="profileImage"
                        className="px-2 py-1 border border-black rounded w-full hidden"
                    />
                    <p>Selected file: {fileName && fileName}</p>
                    {profileImage != null &&
                        <FaTrashCan onClick={(e) => { setFileName(""); setProfileImage(null) }} className="text-xl cursor-pointer" />
                    }
                </div>

                <button type="submit" className='border rounded px-3 py-2 bg-blue-300 w-100 shadow'>Update Profile</button>
            </form>
        </dialog>
    );
};