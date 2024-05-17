import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import { useContext } from "react";
import { AppContext } from "./utils/context";
import AdminPage from "./pages/main/admin/Page";
import BuyerPage from "./pages/main/buyer/Page"
import ManagerPage from "./pages/main/manager/Page"
import DealershipAgentPage from "./pages/main/dealershipAgent/Page"
import Listing from "./pages/main/buyer/Listing";
import Verify from "./pages/main/buyer/Verify";
import Application from "./pages/main/buyer/Application";
import Page from "./pages/main/dealershipBankAgent/Page";

function App() {
    const { userData } = useContext(AppContext);

    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register registerType={'buyer'} />} />
                    <Route path="/manager/register" element={<Register registerType={'manager'} />} />
                    <Route path="/agent/register" element={<Register registerType={'agent'} />} />

                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            {userData.role == "admin" && (
                                <AdminPage />
                            )}
                            {userData.role == "dealershipManager" && (
                                <ManagerPage />
                            )}
                            {userData.role == "buyer" && (
                                <BuyerPage />
                            )}
                            {userData.role == "dealershipAgent" && (
                                <DealershipAgentPage />
                            )}

                            {userData.role == "bankAgent" && (
                                <Page />
                            )}
                        </ProtectedRoute>
                    } />

                    <Route path="/listing/:id" element={<Listing />} />

                    <Route path="/application/:id" element={
                        <ProtectedRoute>
                            <Application />
                        </ProtectedRoute>
                    } />

                    <Route path="/verify" element={
                        <ProtectedRoute>
                            <Verify />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
