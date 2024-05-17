import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { closeModal, handleDialogOutsideClick } from "../utils/functions";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Spinner from "./Spinner";
import { axiosReq } from "../utils/axios";
import { AppContext } from "../utils/context";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export default function ChangePassword({
    modalRef
}) {
    const { isLoading, setIsLoading } = useContext(AppContext);
    const [accessToken, setAccessToken] = useState();
    const navigate = useNavigate();

    async function handleChangePassword(e) {
        try {
            setIsLoading(true);
            e.preventDefault();
            if (e.target.newPasswordVerify.value != e.target.newPassword.value) {
                toast.error("Passwords do not match!");
                return
            };

            const inputs = {
                oldPassword: e.target.oldPassword != undefined ? e.target.oldPassword.value : undefined,
                newPassword: e.target.newPassword.value
            }

            await axiosReq.put("/user/password", inputs);
            setIsLoading(true);
            toast.success("Password changed successfully");
            toast.success("Please login using your new password");
            navigate("/login");
        } catch (error) {
            console.error(error);
            toast.error(error.response.data.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setAccessToken(Cookies.get("access_token"));
    }, [])

    return (
        <dialog ref={modalRef} onClick={(e) => handleDialogOutsideClick(e, modalRef)} className="bg-gray-100 rounded-lg">
            {isLoading && <Spinner></Spinner>}
            <form onSubmit={(e) => handleChangePassword(e)} className='flex flex-col gap-4 justify-center border p-10 text-sm' encType="multipart/form-data">
                <button onClick={() => closeModal(modalRef)} type="button" className="absolute top-3 right-3 text-4xl">
                    <IoIosCloseCircleOutline />
                </button>

                {(accessToken && jwtDecode(accessToken).app_metadata.providers.includes("email")) && (
                    <div className="w-72">
                        <div className="relative w-full min-w-[200px] h-10">
                            <input name="oldPassword" type="password" required
                                className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                                placeholder=" " /><label
                                    className="flex w-full h-full select-none pointer-events-none absolute font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Enter Old Password
                            </label>
                        </div>
                    </div>
                )}
                <div className="w-72">
                    <div className="relative w-full min-w-[200px] h-10">
                        <input name="newPassword" type="password" required
                            className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                            placeholder=" " /><label
                                className="flex w-full h-full select-none pointer-events-none absolute font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Enter New Password
                        </label>
                    </div>
                </div>

                <div className="w-72">
                    <div className="relative w-full min-w-[200px] h-10">
                        <input name="newPasswordVerify" type="password" required
                            className="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                            placeholder=" " /><label
                                className="flex w-full h-full select-none pointer-events-none absolute font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Verify New Password
                        </label>
                    </div>
                </div>
                <button type="submit" className='border rounded px-3 py-2 bg-blue-300 w-100 shadow'>Change Password</button>
            </form>
        </dialog>
    );
};