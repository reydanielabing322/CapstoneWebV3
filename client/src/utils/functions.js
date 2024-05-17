import { useNavigate } from "react-router-dom";
import { axiosReq } from "./axios"
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "./context";

const useLogout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        // todo: blacklist current token
        Cookies.remove("api_access_token")
        Cookies.remove("access_token")
        navigate("/");
    };

    return handleLogout;
};

const checkUserData = (searchParams, setSearchParams, setUserData, setIsLoggedIn) => {
    try {
        let token = Cookies.get("api_access_token")
        if (searchParams.get("api_access_token") != null) {
            token = searchParams.get("api_access_token");
        }
        const decodedToken = jwtDecode(token);
        Cookies.remove("api_access_token");
        Cookies.set("api_access_token", token)
        if (searchParams.get("api_access_token")) {
            setSearchParams(new URLSearchParams());
        }
        setUserData(decodedToken)
        setIsLoggedIn(true);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const useGetApplications = () => {
    const { userData, setApplications } = useContext(AppContext);

    useEffect(() => {
        // if (!userData.firstname || !userData.lastname || !userData.phonenumber) return;
        // if (userData.firstname.trim().length == 0 || userData.lastname.trim().length == 0 || userData.phonenumber.trim().length == 0) return
        const getApplications = async () => {
            try {
                const response = await axiosReq.get("/buyer/applications");
                const responseData = response.data.data.applications;
                setApplications(responseData);
            } catch (error) {
                console.log(error)
            }
        }
        if (userData.role == "buyer" && userData.isapproved == true) {
            getApplications();
        }
    }, [])
}


function openModal(ref) {
    (ref.current).showModal();
}
function closeModal(ref) {
    (ref.current).close();
}
const handleDialogOutsideClick = (e, modalRef) => {
    if (e.target == modalRef.current) {
        closeModal(modalRef)
    }
}

const timeAgo = (date) => {
    const currentDate = new Date();
    const createdAt = new Date(date);
    const timeDifference = currentDate.getTime() - createdAt.getTime();

    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;

    if (timeDifference < minute) {
        return "Just now";
    } else if (timeDifference < hour) {
        const minutes = Math.floor(timeDifference / minute);
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (timeDifference < day) {
        const hours = Math.floor(timeDifference / hour);
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (timeDifference < month) {
        const days = Math.floor(timeDifference / day);
        return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (timeDifference < year) {
        const months = Math.floor(timeDifference / month);
        return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
        const years = Math.floor(timeDifference / year);
        return `${years} year${years > 1 ? "s" : ""} ago`;
    }
};


export { useLogout, openModal, closeModal, handleDialogOutsideClick, timeAgo, checkUserData, useGetApplications };