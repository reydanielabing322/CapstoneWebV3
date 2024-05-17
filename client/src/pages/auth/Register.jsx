import React, { useContext, useEffect, useState } from 'react'
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { axiosReq } from '../../utils/axios';
import Logo from "../../resources/Logo"
import Spinner from '../../components/Spinner';
import { AppContext } from '../../utils/context';
import ManagerRegister from '../../components/ManagerRegister';
import BuyerRegister from '../../components/BuyerRegister';

function Register({ registerType }) {
    const { userData, isLoading, setIsLoading } = useContext(AppContext)
    const [agentRegisterType, setAgentRegisterType] = useState("bankAgent");
    const [noUserDataRegisterType, setNoUserDataRegisterType] = useState('buyer');

    const navigate = useNavigate();

    const handleAgentRegister = async (e) => {
        try {
            e.preventDefault();
            setIsLoading(true);

            const inputs = {};

            for (const element of e.target.elements) {
                if (element.name && element.value) {
                    inputs[element.name] = element.value;
                }
            }

            inputs.agentType = agentRegisterType;
            await axiosReq.post("/agent/register", inputs);
            setIsLoading(false);
            toast.success("Successfully added new agent")
            e.target.reset();
        } catch (error) {
            setIsLoading(false);
            console.error(error);
            toast.error(error.response.data.message);
        }
    }

    useEffect(() => {
        if (registerType == "agent" && userData.role != "dealershipManager") {
            navigate("/")
        }
    }, [])

    return (
        <div>
            {isLoading && <Spinner />}
            <div className='flex flex-col justify-center items-center text-xs p-5'>
                <div className='flex-basis-[20%]'>
                    <Logo />
                </div>
                <div>
                    {!userData && (
                        noUserDataRegisterType == "buyer" ? (
                            <BuyerRegister noUserDataRegisterType={noUserDataRegisterType} setNoUserDataRegisterType={setNoUserDataRegisterType} />
                        ) : (
                            <ManagerRegister noUserDataRegisterType={noUserDataRegisterType} setNoUserDataRegisterType={setNoUserDataRegisterType} />
                        )
                    )}

                    {registerType == 'manager' && (
                        <ManagerRegister />
                    )}

                    {registerType == "agent" && (
                        <form onSubmit={(e) => handleAgentRegister(e)} encType='multipart/form-data' className='flex flex-col gap-3 justify-center border p-10 bg-gray-200 rounded-lg'>
                            <h1 className='font-bold text-xl text-center'>Register new agent as</h1>
                            <div className='flex flex-row justify-center gap-2'>
                                <label>
                                    <input type="radio" name="agentType" value="bankAgent" onChange={() => setAgentRegisterType("bankAgent")} checked={agentRegisterType == 'bankAgent'} />
                                    Bank Agent
                                </label>
                                <label>
                                    <input type="radio" name="agentType" value="dealershipAgent" onChange={() => setAgentRegisterType("dealershipAgent")} checked={agentRegisterType == 'dealershipAgent'} />
                                    Dealership Agent
                                </label>
                            </div>

                            <div className='flex flex-row gap-2 w-full'>
                                <input type="text" name="firstName" placeholder='First Name' className='px-2 py-1 border border-black rounded w-1/2' required />
                                <input type="text" name="lastName" placeholder='Last Name' className='px-2 py-1 border border-black rounded w-1/2' required />
                            </div>
                            <input type="email" name="email" placeholder='Enter email' className='px-2 py-1 border border-black rounded' required />
                            <div className='flex flex-row gap-2 items-center'>
                                <label htmlFor="gender" className='text-md font-semibold'>Gender: </label>
                                <select name="gender" className='px-2 py-1 border border-black rounded' required>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>

                            <input type="tel" name="phoneNumber" placeholder='Phone Number' className='px-2 py-1 border border-black rounded' required />
                            <input type="text" name="address" placeholder='Address' className='px-2 py-1 border border-black rounded' required />
                            {agentRegisterType == "bankAgent" && (
                                <>
                                    <input type="text" name="bank" placeholder='Bank' className='px-2 py-1 border border-black rounded' required />
                                    <input type="text" name="bankAddress" placeholder='Bank Address' className='px-2 py-1 border border-black rounded' required />
                                </>
                            )}

                            <button type="submit" className='border rounded px-3 py-2 bg-blue-300 w-100'>Register New Agent</button>
                            <button type="button" onClick={() => navigate(-1)}>Go Back</button>
                        </form>
                    )}

                </div>

            </div >
        </div>
    )
}

export default Register