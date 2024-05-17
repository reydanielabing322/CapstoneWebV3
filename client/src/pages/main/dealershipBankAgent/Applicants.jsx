import React, { useContext, useEffect, useState, useRef } from 'react'
import { axiosReq } from '../../../utils/axios';
import { toast } from "react-toastify"
import { closeModal } from '../../../utils/functions';
import { AppContext } from '../../../utils/context'
import { IoArrowBackCircleSharp } from "react-icons/io5";
import BankLoanDealershipBankChoiceApplicationProgress from './Progress/BankLoanDealershipBankChoiceApplicationProgress';

function Applicants({ applications, setApplications }) {
    const { userData, setIsLoading } = useContext(AppContext);
    const [application, setApplication] = useState();
    const confirmRejectApplicationModalRef = useRef();

    const handleUpdateApplication = async (progress, applicationType, bankAgentId, certificateOfApproval) => {
        try {
            setIsLoading(true)
            const formData = new FormData();
            formData.set("applicationType", "bankLoan(dealershipBankChoice)");
            formData.set("applicationId", application.id);
            formData.set("progress", progress);
            formData.set("bankAgentId", bankAgentId);
            formData.set("certificateOfApproval", certificateOfApproval);

            const response = await axiosReq.put("/agent/application", formData);
            const updatedApplication = response.data.data.application;
            updatedApplication.applicationType = applicationType;

            const updatedApplications = applications.map(a => {
                if (a.id == application.id) {
                    return {
                        ...a,
                        ...updatedApplication,
                    }
                }
                return a;
            })

            setApplications(updatedApplications);
            setApplication(updatedApplication);
            toast.success("Successfully updated application");
        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }

    const handleRejectApplication = async (applicationType) => {
        try {
            setIsLoading(true);
            const inputs = {
                applicationType: application.applicationType,
                applicationId: application.id,
                progress: -1,
            }
            const response = await axiosReq.put("/agent/application", inputs);
            const rejectedApplication = response.data.data.application;
            rejectedApplication.applicationType = applicationType;

            const updatedApplications = applications.map(a => {
                if (a.id == application.id) {
                    return {
                        ...a,
                        ...rejectedApplication,
                    }
                }
                return a;
            })

            setApplications(updatedApplications);
            setApplication(rejectedApplication);
            closeModal(confirmRejectApplicationModalRef);
            toast.success("Rejected application");
        } catch (error) {
            console.error(error)
            toast.error(error.response.data.message)
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        const getApplications = async () => {
            const response = await axiosReq.get("/bankagent/applicants");
            const responseData = response.data.data.applications;
            setApplications(responseData);
        }
        getApplications();
    }, [])

    return (
        <>
            <div className='h-full w-full flex flex-col'>
                <div className='basis-[20%] p-6 flex flex-row gap-3 items-center'>
                    <h1 className='font-black text-4xl'>{userData.dealership.name}</h1>
                    <div className='w-[10%]'>
                        <img src={userData.dealership.image} />
                    </div>
                </div>
                <div className='border border-b border-black w-full h-[1px]'></div>

                <div className={`p-6 w-full ${application != null ? 'h-full' : 'max-h-full'} overflow-y-auto`}>
                    {application != null ? (
                        <div className='w-full h-full relative flex justify-center items-center'>
                            <IoArrowBackCircleSharp onClick={() => setApplication(null)} className='absolute top-0 left-0 text-5xl text-black cursor-pointer text-[#414fbc]' />

                            <BankLoanDealershipBankChoiceApplicationProgress application={application} handleRejectApplication={handleRejectApplication} handleUpdateApplication={handleUpdateApplication} confirmRejectApplicationModalRef={confirmRejectApplicationModalRef} />

                        </div>
                    ) : (
                        <table className='border border-black w-full'>
                            <thead className='border border-b-black'>
                                <tr className='border-b border-black'>
                                    <th className='border border-black w-1/3'>
                                        <p>Name</p>
                                    </th>
                                    <th className='border border-black w-1/3'>
                                        <p>Status</p>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className=''>
                                {applications.map(application => {
                                    const name = `${application.firstname} ${application.lastname}`
                                    return (
                                        <tr onClick={() => setApplication(application)} key={application.id} className='cursor-pointer'>
                                            <td className='border border-black w-1/3'>
                                                <p>{name}</p>
                                            </td>
                                            <td className='border border-black w-1/3'>
                                                <p>{application.status[0].toUpperCase() + application.status.substr(1)}</p>
                                            </td>
                                        </tr>
                                    )
                                }
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    )
}

export default Applicants