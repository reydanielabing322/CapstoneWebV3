const express = require("express")
const router = express.Router()
const path = require("path")
const multer = require("multer")

const upload = multer({ storage: multer.memoryStorage() })

const {
    verifyBuyerToken,
    verifyAdminToken,
    verifyRole,
    verifyDealerManagerToken,
    verifyRoles,
    verifyAccount,
} = require("../controllers/middlewares")

const {
    buyerRegister,
    agentRegister,
    managerRegister,
    login,
    authGoogle,
    authGoogleCallBack,

    getUserProfile,
    updateUserProfile,
    getUserNotifications,
    deleteUserNotification,

    requestOTPCode,
    verifyOTP,

    createListing,
    updateListing,
    deleteListing,
    getListing,

    getDealership,
    getDealershipModeOfPayments,
    updateApplication,
    getBankAgentApplicants,
    getDealershipBankAgents,
    //buyer
    buyerCreateApplication,
    buyerGetListingApplications,

    // createInstallmentApplicationRequest,
    // updateApplicationRequest,
    // updateistrationRequest,

    //dealershipmanager
    getAgents,
    getDealershipListingApplications,
    updateAgentStatus,

    //admin
    updateUserStatus,
    getUsers,

    assetLinks,

    generatePDF,
    changePassword,
    deleteUser,
} = require("../controllers/mainController")

//REGISTER
router.route("/buyer/register").post(buyerRegister)
router
    .route("/manager/register")
    .post(upload.single("dealershipImage"), managerRegister)

router.route("/agent/register").post(verifyDealerManagerToken, agentRegister)

//GOOGLE AUTH
router.route("/auth/google").get(authGoogle)
router.route("/auth/google/callback").get(authGoogleCallBack)
//LOGIN
router.route("/user/login").post(login)

//GET PROFILE
router.route("/user/profile").get(getUserProfile)

//UPDATE PROFILE
router
    .route("/user/profile")
    .put(upload.single("profileImage"), updateUserProfile)

router.route("/user/password").put(changePassword);
router.route("/user").delete(deleteUser);

router.route("/user/notifications").get(verifyRole, getUserNotifications)
router.route("/user/notifications").delete(verifyRole, deleteUserNotification)

router.route("/dealerships").get(getDealership)
router.route("/dealership/listings").get(getListing)
router.route("/dealership/modeofpayments").get(getDealershipModeOfPayments)
router
    .route("/dealership/bankagents")
    .get(
        verifyRoles(["dealershipManager", "dealershipAgent"]),
        getDealershipBankAgents
    )

router
    .route("/dealership/applications")
    .get(
        verifyRoles(["dealershipManager", "dealershipAgent", "bankAgent"]),
        getDealershipListingApplications
    )
router.route("/agents").get(getAgents)

//dealershipAgent routes
router
    .route("/manager/listings")
    .post(upload.single("listingImage"), verifyDealerManagerToken, createListing)
router
    .route("/manager/listings")
    .delete(verifyDealerManagerToken, deleteListing)
router
    .route("/manager/listings")
    .put(upload.single("image"), verifyDealerManagerToken, updateListing)
router
    .route("/manager/agents/status")
    .put(verifyDealerManagerToken, updateAgentStatus)

const buyerDocuments = upload.fields([
    { name: "signature" },
    { name: "validId" },
    { name: "coMakerSignature" },
    { name: "coMakerValidId" },
    { name: "bankLoanCertificate" },
])
router
    .route("/buyer/listings/apply")
    .post(buyerDocuments, verifyBuyerToken, buyerCreateApplication)
router
    .route("/buyer/applications")
    .get(verifyRoles(["buyer"]), buyerGetListingApplications)

router.route("/user/otp").get(requestOTPCode)
router.route("/buyer/verify").post(verifyAccount, verifyOTP)

router
    .route("/agent/application")
    .put(
        upload.single("certificateOfApproval"),
        verifyRoles(["dealershipAgent", "bankAgent"]),
        updateApplication
    )
router
    .route("/bankagent/applicants")
    .get(verifyRoles(["bankAgent"]), getBankAgentApplicants)
// router.route("/dealershipagent/application").put(verifyDealershipAgentToken, updateApplicationRequest);
// router.route("/dealershipagent/registration").put(verifyDealershipAgentToken, updateRegistrationRequest);

//admin
router.route("/admin/users/status").put(verifyAdminToken, updateUserStatus)
router.route("/users").get(verifyAdminToken, getUsers)
router.route("/admin/users").get(verifyAdminToken, getUsers)
router.route("/.well-known/assetlinks.json").get(assetLinks)

module.exports = router
