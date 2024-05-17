import React, { useContext } from 'react'
import { toast } from "react-toastify"
import { axiosReq } from '../../../utils/axios.js';
import { AppContext } from '../../../utils/context'
import { IoPencilOutline } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { GrUserNew } from "react-icons/gr";
import { Link } from 'react-router-dom';
import Register from '../../auth/Register.jsx';

function Agents({ agents, setAgents }) {
    const { userData, setIsLoading } = useContext(AppContext)
    const updateAgentStatus = async (agent, status) => {
        try {
            setIsLoading(true);
            const inputs = {
                agentId: agent.id,
                isApproved: status
            }

            await axiosReq.put("/manager/agents/status", inputs);
            setAgents(agents.map(a => a.id === agent.id ? { ...a, isapproved: status } : a));

            setIsLoading(false);
            toast.success("Successfully changed agent status");
        } catch (error) {
            setIsLoading(false);
            console.error(error)
            toast.error(error.response.data.message)
        }
    }

    return (
        <div className='h-full w-full flex flex-col'>
            <div className='basis-[20%] p-6 flex flex-row gap-3 items-center'>
                <h1 className='font-black text-4xl'>{userData.dealership.name}</h1>
                <div className='w-[10%]'>
                    <img src={userData.dealership.image} />
                </div>
            </div>

            <div className='border border-b border-black w-full h-[1px]'></div>

            <div className='max-h-full overflow-y-auto text-sm p-6 pt-0'>
                <table className='w-full'>
                    <thead className='sticky top-0 bg-white font-black'>
                        <tr className='border-b border-black'>
                            <th className='border-r border-black'>userId</th>
                            <th className='border-r border-black'>Type</th>
                            <th className='border-r border-black'>Full Name</th>
                            <th className='border-r border-black'>Email</th>
                            <th className='border-r border-black'>Address</th>
                            <th className='border-r border-black'>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className=''>
                        {agents.length > 0 && (
                            agents.map(agent => (
                                <tr key={agent.id} className='border-b border-black text-md'>
                                    <td className='border-r border-black p-2'>{agent.id}</td>
                                    <td className='border-r border-black p-2'> {agent.role}</td>
                                    <td className='border-r border-black p-2'>{agent.firstname} {agent.lastname}</td>
                                    <td className='border-r border-black p-2'>{agent.email}</td>
                                    <td className='border-r border-black p-2'>{agent.address}</td>
                                    <td className={`border-r border-black p-2 ${agent.isapproved == true && "text-green-600"}`}>{agent.isapproved == true ? "Approved" : "Pending"}</td>
                                    <td className='p-2'>
                                        {agent.isapproved == true ? (
                                            <div className='flex flex-row gap-2 items-center justify-center text-xl'>
                                                <IoPencilOutline onClick={() => updateAgentStatus(agent, false)} className='text-green-600 cursor-pointer' />
                                                <FaRegTrashCan className='text-red-600 cursor-pointer' />
                                            </div>
                                        ) : (
                                            <div className='flex flex-row gap-2 items-center justify-center text-lg'>
                                                <IoIosCheckmarkCircle onClick={() => updateAgentStatus(agent, true)} className='text-green-600 cursor-pointer' />
                                                <FaRegTrashCan className='text-red-600 cursor-pointer' />
                                            </div>
                                        )
                                        }
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className='flex flex-row items-center p-5'>
                <Link to="/agent/register/" element={<Register registerType={"agent"} />} className='flex flex-row gap-1 bg-[#414fbc] rounded-lg px-3 py-2 items-center text-white'>
                    <GrUserNew />
                    <p>Register Agent</p>
                </Link>
            </div>
        </div>

    )
}

export default Agents