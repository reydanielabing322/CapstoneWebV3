import React, { useContext, useState } from 'react'
import { axiosReq } from '../utils/axios';
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import { FcGoogle } from "react-icons/fc";
import { AppContext } from '../utils/context';

function ManagerRegister({ noUserDataRegisterType, setNoUserDataRegisterType }) {
    const { userData, setIsLoading } = useContext(AppContext)

    const [modeOfPayments, setModeOfPayments] = useState([]);
    const [showBankLoanOptions, setShowBankLoanOptions] = useState(false);
    const [dealershipImage, setDealershipImage] = useState(null);


    const handleManagerRegister = async (e) => {
        try {
            e.preventDefault();
            setIsLoading(true);
            const formData = new FormData();

            for (const element of e.target.elements) {
                if (element.name && element.value) {
                    formData.append(element.name, element.value);
                }
            }

            formData.set("dealershipImage", dealershipImage);
            formData.set("modeOfPayments", modeOfPayments);
            await axiosReq.post("/manager/register", formData);
            setIsLoading(false);
            toast.success("Registered succesfully");
        } catch (error) {
            setIsLoading(false);
            console.error(error)
            toast.error(error.response.data.message)
        }
    }

    const handleModeOfPaymentChange = (event) => {
        const { value, checked } = event.target;
        if (checked) {
            setModeOfPayments(prevOptions => [...prevOptions, value]);
        } else {
            setModeOfPayments(prevOptions => prevOptions.filter(option => option !== value));
        }
    };

    const handleShowBankLoanOption = (e) => {
        setShowBankLoanOptions(!showBankLoanOptions);
    };

    return (
        <form onSubmit={(e) => handleManagerRegister(e)} encType='multipart/form-data' className='flex flex-col gap-3 justify-center border p-10 bg-gray-200 rounded-lg'>
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

            <h1 className='font-bold text-xl text-center'>Dealership Manager Registration</h1>
            <div className='flex flex-row gap-2 w-full'>
                <input type="text" name="firstName" placeholder='First Name' className='px-2 py-1 border border-black rounded w-1/2' required />
                <input type="text" name="lastName" placeholder='Last Name' className='px-2 py-1 border border-black rounded w-1/2' required />
            </div>
            <input type="email" name="email" placeholder='Enter your email' className='px-2 py-1 border border-black rounded' required />
            <input type="password" name="password" placeholder='Password' className='px-2 py-1 border border-black rounded' required />
            <div className='flex flex-row gap-2 items-center'>
                <label htmlFor="gender" className='text-md font-semibold'>Gender: </label>
                <select name="gender" className='px-2 py-1 border border-black rounded' required>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                </select>
            </div>

            <input type="tel" name="phoneNumber" placeholder='Phone Number' className='px-2 py-1 border border-black rounded' required />
            <input type="text" name="dealershipName" placeholder='Dealership Name' className='px-2 py-1 border border-black rounded' required />
            <div className='flex flex-row items-center gap-3'>
                <label htmlFor="dealershipImage" className='font-semibold text-md'>Dealership Image</label>
                <input
                    type="file"
                    accept="image/*"
                    name="dealershipImage"
                    className='px-2 py-1 border border-black rounded'
                    onChange={(e) => setDealershipImage(e.target.files[0])}
                    required
                />
            </div>
            <input type="text" name="establishmentAddress" placeholder='Establishment Address' className='px-2 py-1 border border-black rounded' required />


            
            <input type="text" name="latitude" placeholder='Latitude' className='px-2 py-1 border border-black rounded' required />

            <input type="text" name="longitude" placeholder='Longitude' className='px-2 py-1 border border-black rounded' required />

            <label htmlFor="modeOfPayment">Mode of Payment</label>

            <div className='flex flex-row gap-3'>
                <label className='flex items-center'>
                    <input name="inhouseFinance" value="inhouseFinance" type="checkbox" onChange={handleModeOfPaymentChange} />
                    Inhouse Finance
                </label>

                <label className='flex items-center'>
                    <input name="bankLoan" value="bankLoan" type="checkbox" onChange={handleShowBankLoanOption} />
                    Bank Loan
                </label>

                <label className='flex items-center'>
                    <input name="cash" value="cash" type='checkbox' onChange={handleModeOfPaymentChange} />
                    Cash
                </label>
            </div>

            {showBankLoanOptions && (
                <div className='flex flex-row gap-5'>
                    <label>
                        <input type="checkbox" name="bankLoanOption" value="bankLoan(dealershipBankChoice)" onChange={handleModeOfPaymentChange} />
                        Dealership Bank Choice
                    </label>

                    <label>
                        <input type="checkbox" name="bankLoanOption" value="bankLoan(buyerBankChoice)" onChange={handleModeOfPaymentChange} />
                        Buyer Bank Choice
                    </label>
                </div>
            )}

            {userData.role == 'admin' ? (
                <>
                    <button type="submit" className='border rounded px-3 py-2 bg-blue-300 w-100'>Register Dealership Manager</button>
                    <Link to="/dashboard">Go Back</Link>
                </>
            ) : (
                <>
                    <button type="submit" className='border rounded px-3 py-2 bg-blue-300 w-100'>Sign up</button>

                    <span className='flex flex-row gap-2'>
                        <p>Already have an account?</p>
                        <Link to="/login" className='text-blue-500'>Login</Link>
                    </span>
                </>
            )}


        </form>

    )
}

export default ManagerRegister