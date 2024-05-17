import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../utils/context'
import { axiosReq } from '../../../utils/axios';
import Spinner from '../../../components/Spinner';
import Profile from '../../../components/Profile';
import ManageAccounts from './ManageAccounts';
import Dashboard from './Dashboard';
import SideNav from './SideNav';
import Notifications from './Notifications';

function Page() {
    const { isLoading } = useContext(AppContext)
    const [activeNav, setActiveNav] = useState("dashboard");
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [dealerships, setDealerships] = useState([]);
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {

                let response = await axiosReq.get("/admin/users");
                let users = response.data.data.users;
                setUsers(users);

                response = await axiosReq.get("/dealerships");
                const dealerships = response.data.data.dealerships;
                setDealerships(dealerships);

                response = await axiosReq.get("/agents");
                const agents = response.data.data.agents;
                setAgents(agents);
            } catch (error) {
                console.log(error);
            }
        }

        const fetchNotifications = async () => {
            let response = await axiosReq.get("/user/notifications");
            let notifications = response.data.data.notifications;
            setNotifications(notifications);
        }

        fetchUsers();
        fetchNotifications();

    }, [])

    useEffect(() => {
        console.log(activeNav);
    }, [activeNav])

    return (
        <div className="bg-[#4f41bc]">
            {isLoading && <Spinner />}
            <div className='flex flex-row h-[100vh] w-full'>

                <SideNav activeNav={activeNav} setActiveNav={setActiveNav}></SideNav>
                <div className='rounded-l-[20px] basis-[80%] bg-white'>
                    {activeNav == "dashboard" && (
                        <Dashboard users={users}></Dashboard>
                    )}

                    {activeNav == "manageAccounts" && (
                        <ManageAccounts users={users} setUsers={setUsers} dealerships={dealerships} agents={agents} />
                    )}
                    {activeNav == "notifications" && (
                        <Notifications notifications={notifications} setNotifications={setNotifications}></Notifications>
                    )}

                    {activeNav == "viewProfile" && (
                        <Profile />
                    )}
                </div>
            </div >
        </div>
    )
}

export default Page