import React, { useContext } from 'react'
import { toast } from 'react-toastify';
import { timeAgo } from '../../../utils/functions';
import { FaTrashCan } from "react-icons/fa6";
import { AppContext } from '../../../utils/context';
import { axiosReq } from '../../../utils/axios';

function Notifications({ notifications, setNotifications }) {
    const { setIsLoading } = useContext(AppContext)

    const handleDeleteNotification = async (notification) => {
        try {
            setIsLoading(true);
            await axiosReq.delete("/user/notifications", { data: { notification_id: notification.id } });
            setIsLoading(false);
            setNotifications(notifications.filter(n => n.id != notification.id));
            toast.success("Deleted notification");
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            toast.error(error.response.data.message)
        }
    }

    return (
        <div className='h-full w-full flex flex-col'>
            <div className='basis-[20%] p-6 flex flex-col justify-between'>
                <h1 className='font-black text-2xl'>Notifications</h1>
            </div>
            <div className='border border-b border-black w-full h-[1px]'></div>
            <div className='flex flex-col gap-4 p-6 w-full justify-between text-center overflow-y-auto'>
                {[...notifications].reverse().map(notification => {
                    return (
                        <div key={notification.id} className='px-4 py-3 bg-[#A7E8E8] rounded-lg flex flex-row justify-between items-center'>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>{notification.notification}</p>
                                <p className="text-sm">{timeAgo(notification.createdat)}</p>
                            </div>

                            <FaTrashCan onClick={() => handleDeleteNotification(notification)} className='text-2xl cursor-pointer'></FaTrashCan>
                        </div>
                    )
                })}
            </div>
        </div>

    )
}

export default Notifications