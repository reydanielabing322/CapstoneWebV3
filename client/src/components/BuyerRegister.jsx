import React, { useContext } from 'react'
import { axiosReq } from '../utils/axios';
import { toast } from 'react-toastify';
import { Link } from "react-router-dom"
import { FcGoogle } from "react-icons/fc";
import { AppContext } from '../utils/context';

function BuyerRegister({ noUserDataRegisterType, setNoUserDataRegisterType }) {
    const { userData, setIsLoading } = useContext(AppContext);

    const handleRegister = async (e) => {
        try {
            setIsLoading(true);
            e.preventDefault();

            const formData = {};

            for (const element of e.target.elements) {
                if (element.name && element.value) {
                    formData[element.name] = element.value;
                }
            }
            await axiosReq.post("/buyer/register", formData);
            setIsLoading(false);
            toast.success("Registered succesfully");
            e.target.reset();
        } catch (error) {
            setIsLoading(false);
            console.error(error);
            toast.error(error.response.data.message)
        }
    }

    const handleGoogleRegister = async (e) => {
        const response = await fetch("http://localhost:6969/auth/google");
        const data = await response.json();
        const url = data.data.authorizationUrl;
        window.location.href = url;
    }


    return (
        <form onSubmit={(e) => handleRegister(e)} className='flex flex-col gap-4 justify-center border p-10 pb-5 bg-gray-200 rounded-lg'>
            {!userData && (
                <div className='w-full'>
                    <p className='text-center font-semibold text-base'>Register as</p>
                    <div className='flex justify-center gap-2'>
                        <label className="flex items-center gap-2" htmlFor="buyerRegister" onClick={() => setNoUserDataRegisterType("buyer")}>
                            Buyer
                            <input id="buyerRegister" type="radio" name="userType" checked={noUserDataRegisterType === 'buyer'} onChange={() => { }} />
                        </label>

                        <label className="flex items-center gap-2" htmlFor="managerRegister" onClick={() => setNoUserDataRegisterType("manager")}>
                            Dealership Manager
                            <input id="managerRegister" type="radio" name="userType" checked={noUserDataRegisterType === 'manager'} onChange={() => { }} />
                        </label>
                    </div>
                </div>
            )}

            <h1 className='font-bold text-lg text-center'>Buyer Registration</h1>

            <div className='flex flex-row gap-1'>
                <div class="relative w-full min-w-[200px] h-10">
                    <input name="firstName" required
                        class="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                        placeholder=" " /><label
                            class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">First Name
                    </label>
                </div>

                <div class="relative w-full min-w-[200px] h-10">
                    <input name="lastName" required
                        class="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                        placeholder=" " /><label
                            class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Last Name
                    </label>
                </div>
            </div>

            <div class="relative w-full min-w-[200px] h-10">
                <input name="email" type="email" required
                    class="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                    placeholder=" " /><label
                        class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Email
                </label>
            </div>

            <div class="relative w-full min-w-[200px] h-10">
                <input name="password" type="password" required
                    class="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                    placeholder=" " /><label
                        class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Password
                </label>
            </div>

            <div className='flex flex-row gap-2 items-center'>
                <label htmlFor="gender" className='text-md font-semibold'>Gender: </label>
                <select name="gender" className='px-2 py-1 border border-black rounded' required>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                </select>
            </div>

            <div class="relative w-full min-w-[200px] h-10">
                <input name="phoneNumber" type="tel" required
                    class="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                    placeholder=" " /><label
                        class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Phone Number
                </label>
            </div>

            <div class="relative w-full min-w-[200px] h-10">
                <input name="address" required
                    class="peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                    placeholder=" " /><label
                        class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Address
                </label>
            </div>
            <div className="flex flex-col items-center w-full gap-1">
                <button type="submit" className='w-full border rounded px-3 py-2 bg-blue-300 w-100  shadow-md shadow-gray-300'>Sign up</button>
                <div className='flex flex-row w-[100%] items-center justify-center gap-1'>
                    <div className='border border-b border-black w-[80%] h-[1px]'></div>
                    <p>Or</p>
                    <div className='border border-b border-black w-[80%] h-[1px]'></div>
                </div>

                <button type="button" onClick={handleGoogleRegister} className='border bg-white p-3 rounded-lg flex flex-row items-center gap-2 shadow-md'>
                    <FcGoogle className='text-xl' />
                    <p>Sign Up with Google</p>
                </button>
            </div>


            <span className='flex flex-row gap-2 text-sm'>
                <p>Already have an account?</p>
                <Link to="/login" className='text-blue-500'>Login</Link>
            </span>
        </form>


    )
}

export default BuyerRegister