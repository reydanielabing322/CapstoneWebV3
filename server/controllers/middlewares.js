const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next, privileges) => {
    const token = req.cookies.api_access_token;
    if (!token)
        return res.status(401).json({ status: false, message: "Access token not found" });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.isapproved == false) {
            return res.status(401).json({ status: false, message: "Unauthorized access to endpoint" });
        }
        if (!privileges.includes(payload.role)) {
            return res.status(401).json({ status: false, message: "You don't have the privileges to access this endpoint" });
        }
        if ((payload.firstname && payload.firstname.trim().length == 0) || (payload.lastname && payload.lastname.trim().length == 0) || (payload.phonenumber && payload.phonenumber.trim().length == 0)) {
            return res.status(401).json({ status: false, message: "Please update your profile and fill out all the necessary information" });
        }
        req.tokenData = payload;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ status: false, message: "Unauthorized access to endpoint" });
    }
};

const verifyAccount = async (req, res, next) => {
    const token = req.cookies.api_access_token;
    if (!token)
        return res.status(401).json({ status: false, message: "Access token not found" });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.role != "buyer") {
            return res.status(401).json({ status: false, message: "You don't have the privileges to access this endpoint" });
        }
        if (payload.firstname.trim().length == 0 || payload.lastname.trim().length == 0 || payload.phonenumber.trim().length == 0) {
            return res.status(401).json({ status: false, message: "Please update your profile and fill out all the necessary information" });
        }
        req.tokenData = payload;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ status: false, message: "Unauthorized access to endpoint" });
    }

}

const verifyDealershipAgentToken = async (req, res, next) => {
    await verifyToken(req, res, next, ["dealershipAgent"]);
};

const verifyDealerManagerToken = async (req, res, next) => {
    await verifyToken(req, res, next, ["dealershipManager"]);
};

const verifyBuyerToken = async (req, res, next) => {
    await verifyToken(req, res, next, ["buyer"]);
};

const verifyAdminToken = async (req, res, next) => {
    await verifyToken(req, res, next, ["admin"]);
};
const verifyRole = async (req, res, next) => {
    await verifyToken(req, res, next, ["buyer", "dealershipAgent", "dealershipManager", "admin"]);
};

const verifyRoles = (roles) => {
    return async (req, res, next) => {
        await verifyToken(req, res, next, roles);
    };
};

module.exports = {
    verifyDealershipAgentToken,
    verifyDealerManagerToken,
    verifyBuyerToken,
    verifyAdminToken,
    verifyRole,
    verifyRoles,
    verifyAccount
};
