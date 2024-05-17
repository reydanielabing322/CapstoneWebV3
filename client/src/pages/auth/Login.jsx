import React, { useContext } from 'react'
import Cookies from "js-cookie";
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { axiosReq } from "../../utils/axios";
import { AppContext } from '../../utils/context';
import Logo from "../../resources/Logo"
import { FcGoogle } from "react-icons/fc";
import { CiMail, CiLock } from "react-icons/ci";
import Spinner from '../../components/Spinner';


function Login() {
    const navigate = useNavigate();
    const { setIsLoggedIn, setUserData, isLoading, setIsLoading } = useContext(AppContext);

    const handleLogin = async (e) => {
        try {
            setIsLoading(true);
            e.preventDefault();

            const inputs = {
                email: e.target.email.value,
                password: e.target.password.value
            }

            const response = await axiosReq.post("/user/login", inputs);
            setIsLoggedIn(true);
            setIsLoading(false);
            Cookies.set("api_access_token", response.data.data.token);
            Cookies.set("access_token", response.data.data.access_token);
            setUserData(response.data.data.user);
            navigate("/dashboard")
            toast.success("Login success");
        } catch (e) {
            setIsLoading(false);
            console.log(e);
            toast.error(e.response.data.message);
        }
    }

    const handleGoogleLogin = async () => {
        const response = await axiosReq("/auth/google");
        const url = response.data.data.authorizationUrl;
        window.location.href = url;
    }


    return (
        <>
            {isLoading &&
                <Spinner />
            }
            <div className='flex flex-row justify-around border h-[100vh]'>
                <div className='basis-1/2 flex items-center justify-center'>
                    <div>
                        <div>
                            <Logo width={190} height={107} />
                        </div>
                        <p>Vehicle Documents Processing</p>
                    </div>
                </div>

                <div className='basis-1/2 flex flex-col items-center justify-center'>
                    <form onSubmit={(e) => handleLogin(e)} className='flex flex-col items-center border bg-gray-200 p-32 rounded-lg shadow-md'>
                        <div className='flex flex-col gap-5 mb-2'>
                            <div className='relative'>
                                <CiMail className='absolute top-1/2 transform -translate-y-1/2 left-2 text-lg z-50 ' />
                                <div className="w-72">
                                    <div className="relative w-full min-w-[200px] h-10">
                                        <input name="email" required
                                            className="pl-8 peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                                            placeholder=" " /><label
                                                className="flex w-full h-full select-none pointer-events-none absolute left-5 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Email
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className='relative'>
                                <CiLock className='absolute top-1/2 transform -translate-y-1/2 left-2 text-lg z-50' />
                                <div className="w-72">
                                    <div className="relative w-full min-w-[200px] h-10">
                                        <input name="password" type="password" required
                                            className="pl-8 peer bg-[#FAFAF9] w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-black placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 shadow-md"
                                            placeholder=" " /><label
                                                className="flex w-full h-full select-none pointer-events-none absolute left-5 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:-top-[13px] peer-focus:leading-tight transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[12px] before:content[' '] before:block before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 before:rounded-tl-md peer-focus:-left-3 before:pointer-events-none before:transition-all peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900">Password
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-3 mb-3'>
                            <button type="button" className='text-sm relative left-16'>Forgot password?</button>
                            <button type="submit" className='bg-blue-500 rounded px-4 py-2 font-bold shadow-md'>Login</button>
                        </div>

                        <div className='flex flex-row w-[100%] items-center justify-center gap-3 mb-3'>
                            <div className='border border-b border-black w-[80%] h-[1px]'></div>
                            <p>Or</p>
                            <div className='border border-b border-black w-[80%] h-[1px]'></div>
                        </div>

                        <button onClick={handleGoogleLogin} type="button" className='border bg-white p-3 rounded-lg flex flex-row items-center gap-2 mb-5 shadow-md'>
                            <FcGoogle className='text-xl' />
                            <p>Login with Google</p>
                        </button>

                        <div>
                            <span className='flex flex-row gap-1'>
                                <p>Don't have an account?</p>
                                <Link to="/register" className='text-red-600'>Register now</Link>
                            </span>
                        </div>
                    </form>
                </div>

            </div>
        </>
    )
}

export default Login