import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../../utils/context';
import { toast } from "react-toastify"
import { axiosReq } from '../../../utils/axios';
import { timeAgo } from '../../../utils/functions';
import { FaTrashCan } from "react-icons/fa6";

function Notifications() {
    const { notifications, setNotifications, setIsLoading, userData } = useContext(AppContext);

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

    useEffect(() => {
        const getNotifications = async () => {
            const response = await axiosReq.get("/user/notifications");
            setNotifications(response.data.data.notifications);
        }
        if (userData.isapproved) {
            getNotifications();
        }
    }, [])

    return (
        <div className='overflow-y-auto flex flex-col gap-3'>
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
        </div >
    )
}

export default Notifications