const path = require("path")
const { v4: uuidv4 } = require("uuid")
const { supabase, pool } = require("../config/supabaseConfig")
const asyncHandler = require("express-async-handler")
const {
    validateRequiredFields,
    getBuyerApplications,
    getDealershipApplications,
    uploadFile,
    generatePassword,
} = require("./helper")
const jwt = require("jsonwebtoken")

const nodemailer = require("nodemailer")
const hbs = require("nodemailer-express-handlebars")
const handlebars = require("hbs")
const { google } = require("googleapis")
const PuppeteerHTMLPDF = require("puppeteer-html-pdf")

const mailOAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_API_CLIENT_ID,
    process.env.GMAIL_API_CLIENT_SECRET,
    process.env.GMAIL_API_REDIRECT_URI
)

mailOAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_API_REFRESH_TOKEN,
})

async function sendMail(mailOptions) {
    try {
        const accessToken = await mailOAuth2Client.getAccessToken()
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "roadready4142@gmail.com",
                clientId: process.env.GMAIL_API_CLIENT_ID,
                clientSecret: process.env.GMAIL_API_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_API_REFRESH_TOKEN,
                accessToken: accessToken,
            },
        })

        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve(__dirname, "../views/"),
                defaultLayout: false,
            },
            viewPath: path.resolve(__dirname, "../views/"),
        }

        transport.use("compile", hbs(handlebarOptions))

        const result = await transport.sendMail(mailOptions)
        return result
    } catch (error) {
        console.log(error)
        return error
    }
}

const buyerRegister = asyncHandler(async (req, res) => {
    try {
        const requiredFields = [
            "email",
            "password",
            "firstName",
            "lastName",
            "phoneNumber",
            "address",
            "gender",
        ]
        const fieldsValidation = validateRequiredFields(
            requiredFields,
            req.body,
            res
        )
        if (fieldsValidation) return fieldsValidation

        let { email, password, firstName, lastName, phoneNumber, address, gender } =
            req.body
        let { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: phoneNumber,
                    address: address,
                    gender: gender,
                    role: "buyer",
                    isApproved: false,
                },
            },
        })

        if (error || !data) {
            console.log(error)
            return res.status(400).json({ status: false, message: error.message })
        }
        return res
            .status(201)
            .json({ status: true, message: "Successfully registered" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const managerRegister = asyncHandler(async (req, res) => {
    try {
        const requiredFields = [
            "email",
            "password",
            "firstName",
            "lastName",
            "phoneNumber",
            "gender",
            "dealershipName",
            "establishmentAddress",
            "latitude",
            "longitude",
            "modeOfPayments",
        ]
        const fieldsValidation = validateRequiredFields(
            requiredFields,
            req.body,
            res
        )
        if (fieldsValidation) return fieldsValidation

        let {
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            gender,
            dealershipName,
            establishmentAddress,
            latitude,
            longitude,
            modeOfPayments,
        } = req.body

        let payload
        if (req.cookies.api_access_token) {
            try {
                payload = jwt.verify(
                    req.cookies.api_access_token,
                    process.env.JWT_SECRET
                )
            } catch (error) { }
        }

        let { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: phoneNumber,
                    address: establishmentAddress,
                    gender: gender,
                    role: "dealershipManager",
                    isApproved:
                        payload != undefined && payload.role == "admin" ? true : false,
                },
            },
        })

        if (error)
            return res.status(400).json({ status: false, message: error.message })

        const { data: dealershipImageData, error: dealershipImageError } =
            await supabase.storage
                .from("dealership")
                .upload(uuidv4(), req.file.buffer, {
                    contentType: req.file.mimetype,
                })

        if (dealershipImageError) {
            return res.status(500).json({ status: false, error: error.message })
        }
        const imageURL =
            process.env.supabaseURL +
            `/storage/v1/object/public/` +
            dealershipImageData.fullPath
        let query =
            "INSERT INTO tblDealership (name, latitude, longitude, image, address, manager) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"

        const dealership = (
            await pool.query(query, [
                dealershipName,
                latitude,
                longitude,
                imageURL,
                establishmentAddress,
                data.user.id,
            ])
        ).rows[0]

        modeOfPayments = modeOfPayments.split(",")
        for (const p of modeOfPayments) {
            query = `
            INSERT INTO tblDealershipModeOfPayment (dealership, modeOfPayment)
            SELECT $1, id
            FROM tblModeOfPayment
            WHERE modeOfPayment = $2
            `
            await pool.query(query, [dealership.id, p.trim()])
        }

        return res
            .status(200)
            .json({ status: true, message: "Sucessfully registered" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const agentRegister = asyncHandler(async (req, res) => {
    try {
        const requiredFields = [
            "email",
            "firstName",
            "lastName",
            "phoneNumber",
            "address",
            "gender",
            "agentType",
        ]
        const fieldsValidation = validateRequiredFields(
            requiredFields,
            req.body,
            res
        )
        if (fieldsValidation) return fieldsValidation

        let {
            email,
            firstName,
            lastName,
            phoneNumber,
            address,
            gender,
            agentType,
            bank,
            bankAddress,
        } = req.body

        if (agentType != "dealershipAgent" && agentType != "bankAgent")
            return res
                .status(400)
                .json({ status: "false", message: "Invalid agent type" })

        let query = "SELECT id, name FROM tblDealership WHERE manager = $1"
        const dealership = (await pool.query(query, [req.tokenData.id])).rows[0]

        if (!dealership)
            return res
                .status(404)
                .json({ status: false, message: "Dealership not found" })
        let password = generatePassword();


        let { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: phoneNumber,
                    address: address,
                    gender: gender,
                    role: agentType,
                    isApproved: true,
                },
            },
        })

        const mailOptions = {
            from: "Road Ready <roadready4142@gmail.com>",
            to: email,
            subject: "Account Password",
            template: "password",
            context: {
                password: password,
            },
        }
        await sendMail(mailOptions)

        if (error || !data) {
            return res.status(400).json({ status: false, message: error.message })
        }

        query = `INSERT INTO tblAgent (id, dealership, type) VALUES ($1, $2, $3)`
        await pool.query(query, [data.user.id, dealership.id, agentType])
        if (agentType == "bankAgent") {
            query = `INSERT INTO tblBankAgent (id, bank, bankAddress) VALUES ($1, $2, $3)`
            await pool.query(query, [data.user.id, bank, bankAddress])
        }
        return res
            .status(201)
            .json({ status: true, message: "Successfully registered" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const authGoogle = asyncHandler(async (req, res) => {
    const { oAuth2Client, scopes } = require("../config/googleAuthConfig")
    const authorizationUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        include_granted_scopes: true,
        scope: scopes,
    })
    return res.status(200).json({
        status: true,
        message: "Succesfully fetch google authentication url",
        data: { authorizationUrl },
    })
})

const authGoogleCallBack = asyncHandler(async (req, res) => {
    const { oAuth2Client } = require("../config/googleAuthConfig")
    let { tokens } = await oAuth2Client.getToken(req.query.code)

    const oauth2 = google.oauth2({
        auth: oAuth2Client,
        version: "v2",
    })

    oAuth2Client.setCredentials(tokens)

    const userInfo = await oauth2.userinfo.get()

    const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: tokens.id_token,
        access_token: tokens.access_token,
    })

    let query = "SELECT * FROM tblUserProfile WHERE id = $1"
    const user = (await pool.query(query, [data.user.id])).rows[0]

    if (user.isapproved == false && user.role == "buyer") {
        query =
            "UPDATE tblUserProfile SET isapproved = TRUE WHERE id = $1 AND role = 'buyer'"
        await pool.query(query, [user.id])
        user.isapproved = true
    }

    if (user.role == "dealershipManager") {
        let query = `
            SELECT d.*,
                   json_build_object('id', u.id, 
                                     'firstname', u.firstname, 
                                     'lastname', u.lastname, 
                                     'phonenumber', u.phonenumber) AS manager
                    FROM tblDealership d
            LEFT JOIN tblUserProfile u ON d.manager = u.id
            WHERE d.manager = $1`

        let dealership = (await pool.query(query, [user.id])).rows[0]
        user.dealership = dealership
    }

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: 86400 })

    res.cookie("api_access_token", token, {
        path: "/",
        domain: "",
        sameSite: "None",
        secure: true,
    })

    res.cookie("access_token", data.session.access_token, {
        path: "/",
        domain: "",
        sameSite: "None",
        secure: true,
    })

    res.redirect(
        process.env.node_env == "dev"
            ? `http://localhost:3000/dashboard?api_access_token=${token}&access_token=${data.session.access_token}`
            : `https://roadready-frontend.vercel.app/dashboard?api_access_token=${token}&access_token=${data.session.access_token}`
    )
    return
})

const login = asyncHandler(async (req, res) => {
    try {
        const fieldsvalidation = validateRequiredFields(
            ["email", "password"],
            req.body,
            res
        )

        if (fieldsvalidation) return fieldsvalidation
        const { email, password } = req.body

        let { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error || !data) {
            return res.status(401).json({ status: false, message: error.message })
        }

        let query = `SELECT * FROM tblUserProfile WHERE id = $1`
        const user = (await pool.query(query, [data.user.id])).rows[0]

        if (user.role == "dealershipManager") {
            let query = `
            SELECT d.*,
                   json_build_object('id', u.id, 
                                     'firstname', u.firstname, 
                                     'lastname', u.lastname, 
                                     'phonenumber', u.phonenumber) AS manager
                    FROM tblDealership d
            LEFT JOIN tblUserProfile u ON d.manager = u.id
            WHERE d.manager = $1`

            let dealership = (await pool.query(query, [user.id])).rows[0]
            user.dealership = dealership
        }

        if (user.role == "dealershipAgent" || user.role == "bankAgent") {
            let query = `
                SELECT d.*,
                    json_build_object('id', u.id, 
                        'firstname', u.firstname, 
                        'lastname', u.lastname, 
                        'phonenumber', u.phonenumber) AS manager
                FROM tblDealership d
                LEFT JOIN tblAgent a ON a.dealership = d.id
                LEFT JOIN tblUserProfile u ON d.manager = u.id
                WHERE a.id = $1;
            `

            let dealership = (await pool.query(query, [user.id])).rows[0]
            user.dealership = dealership
        }

        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: 86400 })

        res.cookie("api_access_token", token, {
            path: "/",
            domain: "",
            sameSite: "None",
            secure: true,
        })

        res.cookie("access_token", data.session.access_token, {
            path: "/",
            domain: "",
            sameSite: "None",
            secure: true,
        })

        return res
            .status(200)
            .json({ status: true, message: "Login success", data: { user, token, access_token: data.session.access_token } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const requiredFields = ["user_id"]
        const fieldsValidation = validateRequiredFields(
            requiredFields,
            req.query,
            res
        )

        if (fieldsValidation) return fieldsValidation

        const { user_id } = req.query
        let query = "SELECT * from tblUserProfile WHERE id = $1"
        let user = (await pool.query(query, [user_id])).rows[0]

        if (!user)
            return res.status(404).json({ status: false, message: "User not found" })

        return res.status(200).json({
            status: true,
            message: "Successfully fetched user profile data",
            data: { user },
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const deleteUser = asyncHandler(async (req, res) => {
    try {
        const fieldsValidation = validateRequiredFields(['userId'], req.body, res);
        if (fieldsValidation) return fieldsValidation;

        const { userId } = req.body;

        let query = "DELETE FROM tblUserProfile WHERE id = $1";
        await pool.query(query, [userId]);

        const { data, error } = await supabase.auth.admin.deleteUser(
            userId
        )

        if (error) {
            throw new Error(error.message);
        }

        return res.status(200).json({ status: 200, message: "Successfully deleted account" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const getUserNotifications = asyncHandler(async (req, res) => {
    try {
        let query = "SELECT * FROM tblNotifications WHERE userid = $1"
        const notifications = (await pool.query(query, [req.tokenData.id])).rows
        return res.status(200).json({
            status: true,
            message: "Successfully fetched notifications",
            data: { notifications },
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const deleteUserNotification = asyncHandler(async (req, res) => {
    try {
        const fieldsValidation = validateRequiredFields(
            ["notification_id"],
            req.body,
            res
        )
        const { notification_id } = req.body
        if (fieldsValidation) return fieldsValidation
        let query = "DELETE FROM tblNotifications WHERE id = $1 AND userid = $2"
        await pool.query(query, [notification_id, req.tokenData.id])
        return res
            .status(200)
            .json({ status: true, message: "Successfully deleted notification" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        const updateFields = [
            "firstName",
            "lastName",
            "phoneNumber",
            "address",
            "gender",
        ]
        const updates = {}

        let token = req.cookies.api_access_token
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        updateFields.forEach((field) => {
            if (req.body[field]) {
                updates[field] = req.body[field]
            }
        })

        if (req.file) {
            const { data, error } = await supabase.storage
                .from("profileimage")
                .upload(uuidv4(), req.file.buffer, {
                    contentType: req.file.mimetype,
                })
            if (error) {
                console.log(error)
                return res.status(500).json({ status: false, error: error.message })
            }

            if (payload.profileimage != null) {
                const parts = payload.profileimage.split("/")
                const imgfile = parts.slice(8).join("/")
                await supabase.storage.from("profileimage").remove([imgfile])
            }
            const imageURL =
                process.env.supabaseURL + `/storage/v1/object/public/` + data.fullPath
            updates["profileImage"] = imageURL
        }

        if (Object.keys(updates).length === 0) {
            return res
                .status(400)
                .json({ status: false, error: "No fields to update" })
        }

        const updateValues = Object.values(updates)
        const updatePlaceholders = Object.keys(updates).map(
            (_, index) => `$${index + 1}`
        )

        const query = `
            UPDATE tblUserProfile 
            SET ${Object.keys(updates)
                .map((key, index) => `${key} = ${updatePlaceholders[index]}`)
                .join(", ")}, updatedAt = NOW()
            WHERE id = $${Object.keys(updates).length + 1}
            RETURNING *;
        `

        const updatedUserData = (
            await pool.query(query, [...updateValues, payload.id])
        ).rows[0]

        if (payload.role == "dealershipManager") {
            let query = `
            SELECT d.*,
                   json_build_object('id', u.id, 
                        'firstname', u.firstname, 
                        'lastname', u.lastname, 
                        'phonenumber', u.phonenumber) AS manager
                    FROM tblDealership d
            LEFT JOIN tblUserProfile u ON d.manager = u.id
            WHERE d.manager = $1`

            let dealership = (await pool.query(query, [updatedUserData.id])).rows[0]
            updatedUserData.dealership = dealership
        }

        if (payload.role == "bankAgent" || payload.role == "dealershipAgent") {
            let query = `
                SELECT d.*,
                    json_build_object('id', u.id, 
                        'firstname', u.firstname, 
                        'lastname', u.lastname, 
                        'phonenumber', u.phonenumber) AS manager
                FROM tblDealership d
                LEFT JOIN tblAgent a ON a.dealership = d.id
                LEFT JOIN tblUserProfile u ON d.manager = u.id
                WHERE a.id = $1;
            `

            let dealership = (await pool.query(query, [updatedUserData.id])).rows[0]
            updatedUserData.dealership = dealership
        }
        token = jwt.sign(updatedUserData, process.env.JWT_SECRET, {
            expiresIn: 86400,
        })

        res.cookie("api_access_token", token, {
            path: "/",
            domain: "",
            sameSite: "None",
            secure: true,
        })

        res.cookie("access_token", data.session.access_token, {
            path: "/",
            domain: "",
            sameSite: "None",
            secure: true,
        })

        return res.status(200).json({
            status: true,
            message: "User profile updated successfully",
            data: { user: updatedUserData, token, access_token: data.session.access_token },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const changePassword = asyncHandler(async (req, res) => {
    try {
        const fieldsValidation = validateRequiredFields(['newPassword'], req.body, res)
        if (fieldsValidation) return fieldsValidation

        const { newPassword, oldPassword } = req.body;

        let token = req.cookies.api_access_token
        let access_token = req.cookies.access_token
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        if (oldPassword) {
            let { data, error } = await supabase.auth.signInWithPassword({
                email: payload.email,
                password: oldPassword,
            })
            if (error) return res.status(401).json({ status: false, message: error.message });
        } else {
            const { data, error } = await supabase.auth.getUser(access_token)
            if (error) return res.status(401).json({ status: false, message: error.message });
        }

        const { data: updateData, error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) return res.status(401).json({ status: false, message: updateError.message });

        return res.status(200).json({
            status: true,
            message: "Password updated successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message });
    }
})

const requestOTPCode = asyncHandler(async (req, res) => {
    try {
        const code = Math.floor(1000 + Math.random() * 9000)

        const user = jwt.verify(
            req.cookies.api_access_token,
            process.env.JWT_SECRET
        )

        if (!user)
            return res.status(401).json({ status: false, message: "Invalid token" })
        if (user.role != "buyer")
            return res
                .status(401)
                .json({ status: false, message: "Invalid user privileges" })

        if (
            user.firstname.trim().length == 0 ||
            user.lastname.trim().length == 0 ||
            user.phonenumber.trim().length == 0 ||
            user.address.trim().length == 0
        ) {
            return res.status(401).json({
                status: false,
                message:
                    "Please update your profile and fill out all the necessary information",
            })
        }

        const mailOptions = {
            from: "Road Ready <roadready4142@gmail.com>",
            to: user.email,
            subject: "Your OTP Code",
            template: "otp",
            context: {
                code: code,
            },
        }

        await sendMail(mailOptions)

        let query = "DELETE FROM tblOTP WHERE userId = $1"
        await pool.query(query, [user.id])
        query = "INSERT INTO tblOTP (code, userId, expiredAt) VALUES ($1, $2, $3)"
        let currentDate = new Date()
        currentDate.setMinutes(currentDate.getMinutes() + 10)
        await pool.query(query, [code, user.id, currentDate])

        return res.status(200).json({
            status: true,
            message: "Successfully sent OTP code to your email address",
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

// for buyer role only
const verifyOTP = asyncHandler(async (req, res) => {
    try {
        const fieldsValidation = validateRequiredFields(["code"], req.body, res)
        if (fieldsValidation) return fieldsValidation
        const { code } = req.body

        let user = jwt.verify(req.cookies.api_access_token, process.env.JWT_SECRET)

        query = "SELECT * FROM tblOTP WHERE userId = $1"
        const otp = (await pool.query(query, [user.id])).rows[0]
        if (otp.code != code) {
            return res.status(400).send({ status: false, message: "Invalid code" })
        }
        if (otp.expiredat < new Date()) {
            return res.status(400).json({
                status: false,
                message: "This OTP code has expired please request for another code",
            })
        }

        query =
            "UPDATE tblUserProfile SET isApproved = TRUE, updatedAt = NOW() WHERE id = $1 RETURNING *"
        user = (await pool.query(query, [user.id])).rows[0]

        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: 86400 })

        res.cookie("api_access_token", token, {
            path: "/",
            domain: "",
            sameSite: "None",
            secure: true,
        })

        return res
            .status(200)
            .send({ status: true, message: "Verification success", data: { user } })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, message: error.message })
    }
})

const createListing = asyncHandler(async (req, res) => {
    try {
        const requiredFields = [
            "modelAndName",
            "make",
            "fuelType",
            "power",
            "transmission",
            "engine",
            "fuelTankCapacity",
            "seatingCapacity",
            "price",
            "vehicleType",
        ]

        const fieldsValidation = validateRequiredFields(
            requiredFields,
            req.body,
            res
        )
        if (fieldsValidation) return fieldsValidation

        let {
            modelAndName,
            make,
            fuelType,
            power,
            transmission,
            engine,
            fuelTankCapacity,
            seatingCapacity,
            price,
            vehicleType,
        } = req.body

        price = price.replace(/,/g, "")

        let query = "SELECT * FROM tblDealership WHERE id = $1"
        const dealership = (await pool.query(query, [req.tokenData.dealership.id]))
            .rows[0]

        if (!dealership)
            return res
                .status(404)
                .json({ status: false, message: "Dealership not found" })

        query =
            "SELECT * FROM tblUserProfile WHERE id = $1 AND role = 'dealershipManager'"
        const manager = (await pool.query(query, [req.tokenData.id])).rows[0]

        if (!manager)
            return res
                .status(401)
                .json({ status: false, message: "Unauthorized access to endpoint" })

        if (dealership.manager != manager.id)
            return res.status(401).json({
                status: false,
                message:
                    "You are not authorized to create a listing under this dealership",
            })

        const { data: imageData } = await supabase.storage
            .from("listing")
            .upload(uuidv4(), req.file.buffer, {
                contentType: req.file.mimetype,
            })

        const imageURL =
            process.env.supabaseURL +
            `/storage/v1/object/public/` +
            imageData.fullPath
        query =
            "INSERT INTO tblListing (modelAndName, make, fuelType, power, transmission, engine, fuelTankCapacity, seatingCapacity, price, vehicleType, image, dealership) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *"

        const newListing = (
            await pool.query(query, [
                modelAndName,
                make,
                fuelType,
                power,
                transmission,
                engine,
                fuelTankCapacity,
                seatingCapacity,
                price,
                vehicleType,
                imageURL,
                dealership.id,
            ])
        ).rows

        newListing[0].dealership = req.tokenData.dealership

        return res.status(200).json({
            status: true,
            message: "Successfully listed vehicle",
            data: { newListing },
        })
    } catch (error) {
        console.error("Error:", error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const getListing = asyncHandler(async (req, res) => {
    try {
        const { listing_id, dealership_id, dealership_agent_id, model_and_name } =
            req.query

        let query = `
            SELECT l.*, 
                json_build_object(
                    'id', d.id,
                    'name', d.name,
                    'manager', json_build_object(
                        'id', m.id,
                        'firstname', m.firstname,
                        'lastname', m.lastname,
                        'email', m.email,
                        'phonenumber', m.phonenumber
                    ),
                    'latitude', d.latitude,
                    'longitude', d.longitude,
                    'address', d.address,
                    'image', d.image,
                    'createdat', d.createdat,
                    'updatedat', d.updatedat,
                    'modeofpayments', (
                        SELECT json_agg(json_build_object(
                            'id', p.id,
                            'modeofpayment', mop.modeofpayment
                        ))
                        FROM tblDealershipModeOfPayment p
                        LEFT JOIN tblModeOfPayment mop ON mop.id = p.modeofpayment
                        WHERE p.dealership = d.id
                    )
                ) AS dealership
            FROM tblListing l
            LEFT JOIN tblDealership d ON l.dealership = d.id
            LEFT JOIN tblUserProfile m ON m.id = d.manager
        `

        //TODO OPTIMIZE CODE
        if (listing_id) {
            query += " WHERE l.id = $1;"

            const listing = (await pool.query(query, [listing_id])).rows[0]

            if (!listing)
                return res
                    .status(404)
                    .json({ status: false, message: "Listing not found" })

            return res.status(200).json({
                status: true,
                message: "Successfully fetched listing",
                data: { listing },
            })
        }

        if (dealership_id) {
            query += " WHERE l.dealership = $1;"

            const listings = (await pool.query(query, [dealership_id])).rows

            if (listings.length == 0)
                return res
                    .status(404)
                    .json({ status: false, message: "Listings not found" })
            return res.status(200).json({
                status: true,
                message: "Successfully fetched listings",
                data: { listings },
            })
        }

        if (model_and_name) {
            let filter = `%${model_and_name.toLowerCase()}%`

            query += " WHERE LOWER(l.modelAndName) LIKE $1;"
            const listings = (await pool.query(query, [filter])).rows
            if (listings.length == 0)
                return res
                    .status(404)
                    .json({ status: false, message: "Listings not found" })
            return res.status(200).json({
                status: true,
                message: "Successfully fetched listings",
                data: { listings },
            })
        }

        query += ";"
        const listings = (await pool.query(query)).rows
        if (listings.length == 0)
            return res
                .status(404)
                .json({ status: false, message: "Listings not found" })
        return res.status(200).json({
            status: true,
            message: "Successfully fetched listings",
            data: { listings },
        })
    } catch (error) {
        console.error("Error:", error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const getDealership = asyncHandler(async (req, res) => {
    const { dealership_name, dealership_id, manager } = req.query
    const { latitude, longitude, km } = req.body

    let query = `
            SELECT d.*,
                json_build_object('id', u.id,
                                 'firstname', u.firstname,
                                 'lastname', u.lastname,
                                 'email', u.email,
                                 'phonenumber', u.phonenumber) AS manager,
                (SELECT json_agg(json_build_object(
                                      'id', p.id,
                                      'modeofpayment', mop.modeofpayment
                                  ))
                FROM tblDealershipModeOfPayment p
                LEFT JOIN tblModeOfPayment mop ON mop.id = p.modeofpayment
                WHERE p.dealership = d.id
               ) AS modeofpayments
        FROM tblDealership d
        LEFT JOIN tblUserProfile u ON d.manager = u.id`

    if (dealership_id) {
        query += " WHERE d.id = $1"

        const dealership = (await pool.query(query, [dealership_id])).rows[0]
        if (!dealership)
            return res
                .status(404)
                .json({ status: false, message: "Dealership not found" })
        return res.status(200).json({
            status: true,
            message: "Successfully fetched dealership",
            data: { dealership },
        })
    }

    if (manager) {
        query += " WHERE d.manager = $1"

        const dealership = (await pool.query(query, [manager])).rows[0]
        if (!dealership)
            return res
                .status(404)
                .json({ status: false, message: "Dealership not found" })
        return res.status(200).json({
            status: true,
            message: "Successfully fetched dealership",
            data: { dealership },
        })
    }

    //todo
    if (latitude && longitude && km) {
        query += ` WHERE acos(sin(radians(latitude)) * sin(radians($1)) +
                        cos(radians(latitude)) * cos(radians($2)) *
                        cos(radians(longitude) - radians($3))) * 6371 <= $4`

        const dealerships = (
            await pool.query(query, [latitude, latitude, longitude, km])
        ).rows
        return res.status(200).json({
            status: true,
            message: "Successfully fetched dealerships",
            data: { dealerships },
        })
    }

    if (dealership_name) {
        const filter = `%${dealership_name.toLowerCase()}%`
        query += " WHERE LOWER(name) LIKE $1;"

        const dealerships = (await pool.query(query, [filter])).rows
        return res.status(200).json({
            status: true,
            message: "Successfully fetched dealerships",
            data: { dealerships },
        })
    }

    const dealerships = (await pool.query(query)).rows
    return res.status(200).json({
        status: true,
        message: "Successfully fetched dealerships",
        data: { dealerships },
    })
})

const getDealershipModeOfPayments = async (req, res) => {
    try {
        const fieldsValidation = validateRequiredFields(
            ["dealership_id"],
            req.query,
            res
        )
        if (fieldsValidation) return fieldsValidation

        const { dealership_id } = req.query

        const query = `
            SELECT p.*, mop.modeofpayment
            FROM tblDealershipModeOfPayment p
            LEFT JOIN tblModeOfPayment mop ON mop.id = p.modeofpayment
            WHERE p.dealership = $1;
        `

        const modeofpayments = (await pool.query(query, [dealership_id])).rows
        res.status(200).json({
            status: false,
            message: "Successfully fetched dealership mode of payments",
            data: { modeofpayments },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message })
    }
}

const deleteListing = asyncHandler(async (req, res) => {
    const fieldsValidation = validateRequiredFields(["listingId"], req.body, res)
    if (fieldsValidation) return fieldsValidation
    const { listingId } = req.body
    try {
        let query =
            "DELETE FROM tblListing WHERE id = $1 AND dealership = $2 RETURNING *"

        const deletedListing = (
            await pool.query(query, [listingId, req.tokenData.dealership.id])
        ).rows[0]
        const deleteListingImage = deletedListing.image

        const parts = deleteListingImage.split("/")
        const imgfile = parts.slice(8).join("/")

        await supabase.storage.from("listing").remove([imgfile])

        return res
            .status(200)
            .json({ status: true, message: "Successfully deleted listing" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const updateListing = asyncHandler(async (req, res) => {
    try {
        const updateFields = [
            "modelandname",
            "make",
            "fueltype",
            "power",
            "transmission",
            "engine",
            "fueltankcapacity",
            "seatingcapacity",
            "price",
        ]

        const updates = {}
        updateFields.forEach((field) => {
            if (req.body[field]) {
                updates[field] = req.body[field]
            }
        })

        if (req.file) {
            const { data } = await supabase.storage
                .from("listing")
                .upload(uuidv4(), req.file.buffer, {
                    contentType: req.file.mimetype,
                })
            const parts = req.body.oldImage.split("/")
            const imgfile = parts.slice(8).join("/")

            await supabase.storage.from("listing").remove([imgfile])
            updates[
                "image"
            ] = `${process.env.supabaseURL}/storage/v1/object/public/${data.fullPath};`
        }

        if (Object.keys(updates).length === 0) {
            return res
                .status(400)
                .json({ status: false, message: "No fields to update" })
        }

        const updateValues = Object.values(updates)
        const updatePlaceholders = Object.keys(updates).map(
            (_, index) => `$${index + 1} `
        )

        let query = `
            UPDATE tblListing 
            SET ${Object.keys(updates)
                .map((key, index) => `${key} = ${updatePlaceholders[index]}`)
                .join(", ")}, updatedAt = NOW()
            WHERE id = $${Object.keys(updates).length + 1} AND dealership = $${Object.keys(updates).length + 2
            }
            RETURNING *;`

        const updatedListing = (
            await pool.query(query, [
                ...updateValues,
                req.body.listing_id,
                req.tokenData.dealership.id,
            ])
        ).rows

        if (updatedListing.length == 0)
            return res
                .status(404)
                .json({ status: false, message: "Listing not found" })

        updatedListing[0].dealership = req.tokenData.dealership

        return res.status(200).json({
            status: true,
            message: "Successfully updated listing",
            data: { updatedListing },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const getDealershipListingApplications = asyncHandler(async (req, res) => {
    try {
        const applications = await getDealershipApplications(
            req.tokenData.dealership
        )

        return res.status(200).json({
            status: true,
            message: "Successfully fetched dealership applications",
            data: { applications },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const getDealershipBankAgents = asyncHandler(async (req, res) => {
    try {
        let query = `SELECT u.*
            FROM tblUserProfile u
            LEFT JOIN tblAgent a ON a.id = u.id
            WHERE dealership = $1 AND type = 'bankAgent'`

        const bankagents = (await pool.query(query, [req.tokenData.dealership.id]))
            .rows
        return res.status(200).json({
            status: true,
            message: "Successfully fetched bank agents",
            data: { bankagents },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const updateApplication = asyncHandler(async (req, res) => {
    try {
        const requiredFields = ["applicationType", "applicationId", "progress"]
        const fieldsValidation = validateRequiredFields(
            requiredFields,
            req.body,
            res
        )

        if (fieldsValidation) return fieldsValidation

        const { applicationType, applicationId, progress } = req.body

        let application
        let query
        let table
        switch (applicationType) {
            case "cash":
                table = "tblCashApplication"
                if (req.tokenData.role != "dealershipAgent")
                    return res.status(401).json({
                        status: false,
                        message: "You don't have the privilege to perform this operation",
                    })

                if (progress == -1) {
                    query = `UPDATE ${table} SET agent = $1, status = 'rejected', updatedAt = NOW() WHERE id = $2 RETURNING *;`
                    application = (
                        await pool.query(query, [req.tokenData.id, applicationId])
                    ).rows[0]
                } else if (progress == 1) {
                    query = `UPDATE ${table} SET progress = $1, agent = $2, status = 'on-going', updatedAt = NOW() WHERE id = $3 RETURNING *;`
                    application = (
                        await pool.query(query, [progress, req.tokenData.id, applicationId])
                    ).rows[0]
                } else if (progress == 4) {
                    query = `UPDATE ${table} SET progress = $1, status = 'completed', updatedAt = NOW() WHERE id = $2 RETURNING *;`
                    application = (await pool.query(query, [progress, applicationId]))
                        .rows[0]

                    const applicationPDF = await generatePDF(application)
                    const applicationPDFUpload = await supabase.storage
                        .from("application")
                        .upload(uuidv4(), applicationPDF, {
                            contentType: "application/pdf",
                        })

                    const applicationPDFUploadURL =
                        process.env.supabaseURL + `/storage/v1/object/public/` +
                        applicationPDFUpload.data.fullPath

                    query = `UPDATE ${table} SET applicationpdf = $1 WHERE id = $2 RETURNING *;`
                    application = (
                        await pool.query(query, [applicationPDFUploadURL, applicationId])
                    ).rows[0]
                    query = `UPDATE tblListing SET isavailable = FALSE, updatedAt = NOW() WHERE id = $1;`

                    await pool.query(query, [application.listing])
                } else {
                    query = `UPDATE ${table} SET progress = $1, updatedAt = NOW() WHERE id = $2 AND agent = $3 RETURNING *;`
                    application = (
                        await pool.query(query, [progress, applicationId, req.tokenData.id])
                    ).rows[0]
                }

                switch (parseInt(progress)) {
                    case -1:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' was rejected')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 1:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' is now on-going for review')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 2:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your submitted documents for application ' || $2 || ' was accepted')"
                        await pool.query(query, [application.buyer, application.id])
                        break
                    case 3:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your payment for application ' || $2 || ' was successfully verified')"
                        await pool.query(query, [application.buyer, application.id])
                        break
                    case 4:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' is completed')"
                        await pool.query(query, [application.buyer, application.id])
                }
                return res.status(200).json({
                    status: true,
                    message: "Successfully updated application",
                    data: { application },
                })

            case "inhouseFinance":
                table = "tblinhouseFinanceApplication"

                if (progress == -1) {
                    query = `UPDATE ${table} SET agent = $1, status = 'rejected', updatedAt = NOW() WHERE id = $2 RETURNING *;`
                    application = (
                        await pool.query(query, [req.tokenData.id, applicationId])
                    ).rows[0]
                } else if (progress == 1) {
                    query = `UPDATE ${table} SET progress = $1, agent = $2, status = 'on-going', updatedAt = NOW() WHERE id = $3 RETURNING *;`
                    application = (
                        await pool.query(query, [progress, req.tokenData.id, applicationId])
                    ).rows[0]
                } else if (progress == 4) {
                    query = `UPDATE ${table} SET progress = $1, status = 'completed', updatedAt = NOW() WHERE id = $2 RETURNING *;`
                    application = (await pool.query(query, [progress, applicationId]))
                        .rows[0]

                    const applicationPDF = await generatePDF(application)
                    const applicationPDFUpload = await supabase.storage
                        .from("application")
                        .upload(uuidv4(), applicationPDF, {
                            contentType: "application/pdf",
                        })

                    const applicationPDFUploadURL =
                        process.env.supabaseURL + `/storage/v1/object/public/` +
                        applicationPDFUpload.data.fullPath

                    query = `UPDATE ${table} SET applicationpdf = $1 WHERE id = $2 RETURNING *;`
                    application = (
                        await pool.query(query, [applicationPDFUploadURL, applicationId])
                    ).rows[0]
                    query = `UPDATE tblListing SET isavailable = FALSE, updatedAt = NOW() WHERE id = $1;`

                    await pool.query(query, [application.listing])
                } else {
                    query = `UPDATE ${table} SET progress = $1, updatedAt = NOW() WHERE id = $2 AND agent = $3 RETURNING *;`

                    application = (
                        await pool.query(query, [progress, applicationId, req.tokenData.id])
                    ).rows[0]
                }

                switch (parseInt(progress)) {
                    case -1:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' was rejected')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 1:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' is now on-going for review')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 2:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your submitted documents for application ' || $2 || ' was accepted')"
                        await pool.query(query, [application.buyer, application.id])
                        break
                    case 3:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Credit investigation for you application' || $2 || ' was accepted')"
                        await pool.query(query, [application.buyer, application.id])
                        break
                    case 4:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' is completed')"
                        await pool.query(query, [application.buyer, application.id])
                        break
                }
                return res.status(200).json({
                    status: true,
                    message: "Successfully updated application",
                    data: { application },
                })

            case "bankLoan(buyerBankChoice)":
                table = "tblBuyerBankLoanApplication"
                if (progress == -1) {
                    query = `UPDATE ${table} SET agent = $1, status = 'rejected', updatedAt = NOW() WHERE id = $2 RETURNING *;`
                    application = (
                        await pool.query(query, [req.tokenData.id, applicationId])
                    ).rows[0]
                }
                if (progress == 1) {
                    query = `UPDATE ${table} SET progress = $1, agent = $2, status = 'on-going', updatedAt = NOW() WHERE id = $3 RETURNING *;`
                    application = (
                        await pool.query(query, [progress, req.tokenData.id, applicationId])
                    ).rows[0]
                } else if (progress == 4) {
                    query = `UPDATE ${table} SET progress = $1, status = 'completed', updatedAt = NOW() WHERE id = $2 RETURNING *;`
                    application = (await pool.query(query, [progress, applicationId]))
                        .rows[0]

                    const applicationPDF = await generatePDF(application)
                    const applicationPDFUpload = await supabase.storage
                        .from("application")
                        .upload(uuidv4(), applicationPDF, {
                            contentType: "application/pdf",
                        })

                    const applicationPDFUploadURL =
                        process.env.supabaseURL + `/storage/v1/object/public/` +
                        applicationPDFUpload.data.fullPath

                    query = `UPDATE ${table} SET applicationpdf = $1 WHERE id = $2 RETURNING *;`
                    application = (
                        await pool.query(query, [applicationPDFUploadURL, applicationId])
                    ).rows[0]
                    query = `UPDATE tblListing SET isavailable = FALSE, updatedAt = NOW() WHERE id = $1;`

                    await pool.query(query, [application.listing])
                } else {
                    query =
                        "UPDATE tblBuyerBankLoanApplication SET progress = $1, updatedAt = NOW() WHERE id = $2 AND agent = $3 RETURNING *"
                    application = (
                        await pool.query(query, [progress, applicationId, req.tokenData.id])
                    ).rows[0]
                }

                switch (parseInt(progress)) {
                    case -1:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' was rejected')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 1:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' is now on-going for review')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 2:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your submitted documents for application ' || $2 || ' was accepted')"
                        await pool.query(query, [application.buyer, application.id])
                        break
                    case 3:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your submitted bank certificate for application ' || $2 || ' was accepted')"
                        await pool.query(query, [application.buyer, application.id])
                        break
                    case 4:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' is completed')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                }
                return res.status(200).json({
                    status: true,
                    message: "Successfully updated application",
                    data: { application },
                })

            case "bankLoan(dealershipBankChoice)":
                table = "tblDealershipBankLoanApplication"
                if (progress < 4 || progress == 7) {
                    if (req.tokenData.role != "dealershipAgent")
                        return res.status(401).json({
                            status: false,
                            message: "You don't have the privilege to perform this operation",
                        })

                    if (progress == 1) {
                        query = `UPDATE ${table} SET progress = $1, agent = $2, status = 'on-going', updatedAt = NOW() WHERE id = $3 RETURNING *;`
                        application = (
                            await pool.query(query, [
                                progress,
                                req.tokenData.id,
                                applicationId,
                            ])
                        ).rows[0]
                    }
                    if (progress == 2) {
                        query = `UPDATE ${table} SET progress = $1, updatedAt = NOW() WHERE id = $2 AND agent = $3 RETURNING *;`
                        application = (
                            await pool.query(query, [
                                progress,
                                applicationId,
                                req.tokenData.id,
                            ])
                        ).rows[0]
                    }
                    if (progress == 3) {
                        const requiredFields = ["bankAgentId"]
                        const fieldsValidation = validateRequiredFields(
                            requiredFields,
                            req.body,
                            res
                        )
                        if (fieldsValidation) return fieldsValidation
                        query = `UPDATE ${table} SET progress = $1, bankAgent = $2, updatedAt = NOW() WHERE id = $3 and agent = $4 RETURNING *;`
                        application = (
                            await pool.query(query, [
                                progress,
                                req.body.bankAgentId,
                                applicationId,
                                req.tokenData.id,
                            ])
                        ).rows[0]
                    }
                    if (progress == 7) {
                        query = `UPDATE ${table} SET progress = $1, status = 'completed', updatedAt = NOW() WHERE id = $2 RETURNING *;`
                        application = (await pool.query(query, [progress, applicationId]))
                            .rows[0]

                        const applicationPDF = await generatePDF(application)
                        const applicationPDFUpload = await supabase.storage
                            .from("application")
                            .upload(uuidv4(), applicationPDF, {
                                contentType: "application/pdf",
                            })


                        const applicationPDFUploadURL =
                            process.env.supabaseURL + `/storage/v1/object/public/` +
                            applicationPDFUpload.data.fullPath

                        query = `UPDATE ${table} SET applicationpdf = $1 WHERE id = $2 RETURNING *;`
                        application = (
                            await pool.query(query, [applicationPDFUploadURL, applicationId])
                        ).rows[0]
                        query = `UPDATE tblListing SET isavailable = FALSE, updatedAt = NOW() WHERE id = $1;`

                        await pool.query(query, [application.listing])
                    }
                } else {
                    if (req.tokenData.role != "bankAgent")
                        return res.status(401).json({
                            status: false,
                            message: "You don't have the privilege to perform this operation",
                        })

                    if (progress == 6) {
                        const certificateUpload = await uploadFile(req.file, "certificate")

                        const certificateUploadURL =
                            process.env.supabaseURL + `/storage/v1/object/public/` +
                            certificateUpload.fullPath

                        query = `UPDATE ${table} SET progress = $1, loancertificate = $2, updatedAt = NOW() WHERE id = $3 and bankAgent = $4 RETURNING *;`
                        application = (
                            await pool.query(query, [
                                progress,
                                certificateUploadURL,
                                applicationId,
                                req.tokenData.id,
                            ])
                        ).rows[0]
                    } else {
                        query = `UPDATE ${table} SET progress = $1, updatedAt = NOW() WHERE id = $2 and bankAgent = $3 RETURNING *;`
                        application = (
                            await pool.query(query, [
                                progress,
                                applicationId,
                                req.tokenData.id,
                            ])
                        ).rows[0]
                    }
                }

                switch (parseInt(progress)) {
                    case -1:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' was rejected')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 1:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' is now on-going for review')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 2:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your submitted documents for application ' || $2 || ' was accepted')"
                        await pool.query(query, [application.buyer, application.id])
                        break
                    case 3:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application ' || $2 || ' was forwarded to one of the dealership bank agent')"
                        await pool.query(query, [application.buyer, application.id])
                        break
                    case 4:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your bank loan application ' || $2 || ' was accepted by the dealership bank agent')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 5:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Credit investigation for your application ' || $2 || ' was accepted by the dealership bank agent')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 6:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Bank loan certificate for your application ' || $2 || ' was submitted by the bank')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                    case 7:
                        query =
                            "INSERT INTO tblNotifications (userId, notification) VALUES ($1, 'Your application for listing ' || $2 || ' is completed')"
                        await pool.query(query, [application.buyer, application.listing])
                        break
                }

                return res.status(200).json({
                    status: true,
                    message: "Successfully updated application",
                    data: { application },
                })
        }
        return res
            .status(401)
            .json({ status: false, message: "Invalid application type" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const getBankAgentApplicants = asyncHandler(async (req, res) => {
    try {
        let query =
            "SELECT * FROM tblDealershipBankLoanApplication WHERE bankagent = $1"
        const applications = (await pool.query(query, [req.tokenData.id])).rows
        return res.status(200).json({
            status: false,
            message: "Successfully fetched applications",
            data: { applications },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const buyerCreateApplication = asyncHandler(async (req, res) => {
    try {
        let requiredFields = [
            "modeofpayment",
            "listingId",
            "firstName",
            "lastName",
            "address",
            "phoneNumber",
        ]
        let fieldsValidation = validateRequiredFields(requiredFields, req.body, res)

        if (fieldsValidation) {
            return fieldsValidation
        }

        const {
            modeofpayment,
            listingId,
            firstName,
            lastName,
            address,
            phoneNumber,
        } = req.body

        const applications = await getBuyerApplications(req.tokenData)
        if (applications.length > 1)
            return res.status(400).json({
                status: false,
                message: "You have reached the limit for the number of applications.",
            })

        let query
        query = "SELECT * FROM tblListing WHERE id = $1"
        const listing = (await pool.query(query, [listingId])).rows[0]
        if (!listing)
            return res
                .status(400)
                .json({ status: false, message: "Listing not found" })
        if (listing.isavailable == false)
            return res
                .status(400)
                .json({ status: false, message: "Listing is not available" })

        const signatureUpload = await uploadFile(
            req.files["signature"][0],
            "request/signature"
        )
        const validIdUpload = await uploadFile(
            req.files["validId"][0],
            "request/validId"
        )

        const signatureURL =
            process.env.supabaseURL +
            `/storage/v1/object/public/` +
            signatureUpload.fullPath
        const validIdURL =
            process.env.supabaseURL +
            `/storage/v1/object/public/` +
            validIdUpload.fullPath

        switch (modeofpayment) {
            case "cash":
                requiredFields = ["cashmodeofpayment"]
                fieldsValidation = validateRequiredFields(requiredFields, req.body, res)
                if (fieldsValidation) return fieldsValidation
                query =
                    "INSERT INTO tblCashApplication(buyer, listing, modeofpayment, firstname, lastname, address, phonenumber, signature, validId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *"
                application = (
                    await pool.query(query, [
                        req.tokenData.id,
                        listingId,
                        req.body.cashmodeofpayment,
                        firstName,
                        lastName,
                        address,
                        phoneNumber,
                        signatureURL,
                        validIdURL,
                    ])
                ).rows[0]
                return res.status(200).json({
                    status: true,
                    message: "Successfully submitted application",
                    data: { application },
                })
            case "inhouseFinance":
                requiredFields = [
                    "coMakerFirstName",
                    "coMakerLastName",
                    "coMakerAddress",
                    "coMakerPhoneNumber",
                ]

                fieldsValidation = validateRequiredFields(requiredFields, req.body, res)

                if (fieldsValidation) return fieldsValidation

                const {
                    coMakerFirstName,
                    coMakerLastName,
                    coMakerAddress,
                    coMakerPhoneNumber,
                } = req.body

                const coMakerSignatureUpload = await uploadFile(
                    req.files["coMakerSignature"][0],
                    "request/signature"
                )
                const coMakerValidIdUpload = await uploadFile(
                    req.files["coMakerValidId"][0],
                    "request/validId"
                )

                const coMakerSignatureURL =
                    process.env.supabaseURL +
                    `/storage/v1/object/public/` +
                    coMakerSignatureUpload.fullPath
                const coMakerValidIdURL =
                    process.env.supabaseURL +
                    `/storage/v1/object/public/` +
                    coMakerValidIdUpload.fullPath

                query =
                    "INSERT INTO tblInhouseFinanceApplication(buyer, listing, firstname, lastname, address, phonenumber, signature, validId, coMakerFirstName, coMakerLastName, coMakerAddress, coMakerPhoneNumber, coMakerSignature, coMakerValidId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *"

                application = (
                    await pool.query(query, [
                        req.tokenData.id,
                        listingId,
                        firstName,
                        lastName,
                        address,
                        phoneNumber,
                        signatureURL,
                        validIdURL,
                        coMakerFirstName,
                        coMakerLastName,
                        coMakerAddress,
                        coMakerPhoneNumber,
                        coMakerSignatureURL,
                        coMakerValidIdURL,
                    ])
                ).rows[0]

                return res.status(200).json({
                    status: true,
                    message: "Successfully submitted application",
                    data: { application },
                })

            case "bankLoan(buyerBankChoice)":
                const bankCertificateUpload = await uploadFile(
                    req.files["bankLoanCertificate"][0],
                    "request/bankCertificate"
                )

                const bankCertificateURL =
                    process.env.supabaseURL +
                    `/storage/v1/object/public/` +
                    bankCertificateUpload.fullPath

                query =
                    "INSERT INTO tblBuyerBankLoanApplication (buyer, listing, firstname, lastname, address, phonenumber, signature, validId, bankCertificate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *"

                application = (
                    await pool.query(query, [
                        req.tokenData.id,
                        listingId,
                        firstName,
                        lastName,
                        address,
                        phoneNumber,
                        signatureURL,
                        validIdURL,
                        bankCertificateURL,
                    ])
                ).rows
                return res.status(200).json({
                    status: true,
                    message: "Successfully submitted application",
                    data: { application },
                })
            case "bankLoan(dealershipBankChoice)":
                query =
                    "INSERT INTO tblDealershipBankLoanApplication(buyer, listing, firstname, lastname, address, phonenumber, signature, validId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *"
                application = (
                    await pool.query(query, [
                        req.tokenData.id,
                        listingId,
                        firstName,
                        lastName,
                        address,
                        phoneNumber,
                        signatureURL,
                        validIdURL,
                    ])
                ).rows[0]
                return res.status(200).json({
                    status: true,
                    message: "Successfully submitted application",
                    data: { application },
                })
        }

        return res
            .status(400)
            .json({ status: false, message: "Invalid mode of payment" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const buyerGetListingApplications = asyncHandler(async (req, res) => {
    try {
        const applications = await getBuyerApplications(req.tokenData)
        return res.status(200).json({
            status: true,
            message: "Successfully fetched buyer listing applications",
            data: { applications },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const createVehicle = async (listing, buyerId) => {
    const {
        modelandname,
        make,
        fueltype,
        power,
        transmission,
        engine,
        fueltankcapacity,
        seatingcapacity,
        price,
        vehicletype,
        image,
        dealership,
        dealershipagent,
    } = listing
    let query =
        "INSERT INTO tblVehicle (id, userId, modelAndName, make, fuelType, power, transmission, engine, fuelTankCapacity, seatingCapacity, price, vehicleType, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *"
    const vehicle = (
        await pool.query(query, [
            listing.id,
            buyerId,
            modelandname,
            make,
            fueltype,
            power,
            transmission,
            engine,
            fueltankcapacity,
            seatingcapacity,
            price,
            vehicletype,
            image,
        ])
    ).rows[0]

    query =
        "INSERT INTO tblRegistrationRequest (vehicleId, dealership, dealershipAgent) VALUES ($1, $2, $3)"
    await pool.query(query, [vehicle.id, dealership, dealershipagent])
}

const updateApplicationRequest = asyncHandler(async (req, res) => {
    try {
        const fieldsValidation = validateRequiredFields(
            ["progress, listingId"],
            req.body,
            res
        )
        if (fieldsValidation) return fieldsValidation
        const {
            cashApplicationRequest,
            installmentApplicationRequest,
            progress,
            listingId,
        } = req.body
        //progress 1-5;
        //should be an authorized agent and should be "employed" in the dealership

        let query =
            "SELECT * FROM tblDealershipAgent WHERE id = $1 AND isAuthorized = true"
        const agent = (await pool.query(query, [req.tokenData.id])).rows[0]
        if (!agent)
            return res
                .status(401)
                .json({ status: false, message: "Unauthorized access to endpoint" })

        query = "SELECT * FROM tblListing WHERE id = $1"
        const listing = (await pool.query(query, [listingId])).rows[0]
        if (!listing)
            return res
                .status(404)
                .json({ status: false, message: "Listing not found" })
        if (listing.dealershipagent != req.tokenData.id)
            return res
                .status(401)
                .json({ status: false, message: "Unauthorized access to endpoint" })

        if (cashApplicationRequest) {
            let query =
                "UPDATE tblCashApplicationRequest SET progress = $1, updatedAt = NOW() RETURNING *"
            const applicationRequest = (await pool.query(query, [progress])).rows[0]

            //delete other applications on this listing if it is already released
            if (applicationRequest.progress >= 4)
                return res
                    .status(400)
                    .json({ status: false, message: "Vehicle is already released" })

            if (progress == 4) {
                query =
                    "UPDATE tblListing SET isAvailable = false, updatedAt = NOW() WHERE id = $1"
                await pool.query(query, [listing.id])
                createVehicle(listing, applicationRequest.buyerid)
            }

            return res
                .status(200)
                .json({ status: true, message: "Updated application progress" })
        }

        if (installmentApplicationRequest) {
            let query =
                "UPDATE tblInstallmentApplicationRequest SET progress = $1, updatedAt = NOW() RETURNING *"
            const applicationRequest = (await pool.query(query, [progress])).rows[0]

            //delete other applications on this listing if it is already released
            if (applicationRequest.progress >= 4)
                return res
                    .status(400)
                    .json({ status: false, message: "Vehicle is already released" })

            query =
                "UPDATE tblListing SET isAvailable = false, updatedAt = NOW() WHERE id = $1"
            await pool.query(query, [listing.id])
            if (progress == 4) {
                createVehicle(listing, applicationRequest.buyerid)
            }

            return res
                .status(200)
                .json({ status: true, message: "Updated application progress" })
        }

        return res
            .status(400)
            .json({ status: false, message: "Application type is required" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const updateRegistrationRequest = asyncHandler(async (req, res) => {
    try {
        const fieldsValidation = validateRequiredFields(
            ["registrationRequestId", "progress"],
            req.body,
            res
        )
        if (fieldsValidation) return fieldsValidation
        const { registrationRequestId, progress } = req.body

        let query =
            "UPDATE tblRegistrationRequest SET progress = $1, updatedAt = NOW() WHERE id = $2 AND dealershipagent = $3 RETURNING *"
        const request = (
            await pool.query(query, [
                progress,
                registrationRequestId,
                req.tokenData.id,
            ])
        ).rows[0]

        if (progress == 3) {
            const registeredOn = new Date()
            const expiry = new Date()
            expiry.setFullYear(expiry.getFullYear() + 3)

            query =
                "UPDATE tblVehicle SET isRegistered = true, registeredon = $1, registrationexpiry = $2, updatedAt = NOW()"
            await pool.query(query, [registeredOn, expiry])

            query =
                "UPDATE tblCashApplicationRequest SET progress = 5, updatedAt = NOW() WHERE listingId = $1"
            await pool.query(query, [request.vehicleid])

            query =
                "UPDATE tblInstallmentApplicationRequest SET progress = 5, updatedAt = NOW() WHERE listingId = $1"
            await pool.query(query, [request.vehicleid])
        }
        return res
            .status(200)
            .json({ status: true, message: "Updated registration progress" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

//dealershipManager
const getAgents = asyncHandler(async (req, res) => {
    try {
        let query = `
            SELECT P.*,
            json_build_object(
                'id', D.id,
                'name', D.name,
                'latitude', D.latitude,
                'longitude', D.longitude,
                'address', D.address,
                'manager', D.manager,
                'image', D.image,
                'createdAt', D.createdAt,
                'updatedAt', D.updatedAt
            ) AS dealership
            FROM tblUserProfile P
            JOIN tblAgent A ON P.id = A.id
            JOIN tblDealership D ON A.dealership = D.id
        `
        const payload = jwt.verify(
            req.cookies.api_access_token,
            process.env.JWT_SECRET
        )
        if (payload.role == "dealershipManager") {
            query += " WHERE D.manager = $1;"
            let agents = (await pool.query(query, [payload.id])).rows
            agents = await Promise.all(
                agents.map(async (agent) => {
                    if (agent.role !== "bankAgent") return agent
                    query = "SELECT * FROM tblBankAgent WHERE id = $1"
                    const bankAgent = (await pool.query(query, [agent.id])).rows[0]
                    return {
                        ...agent,
                        bank: bankAgent.bank,
                        bankaddress: bankAgent.bankaddress,
                    }
                })
            )
            return res.status(200).json({
                status: true,
                message: "Successfully fetched agents",
                data: { agents },
            })
        } else if (payload.role == "admin") {
            let agents = (await pool.query(query)).rows
            agents = await Promise.all(
                agents.map(async (agent) => {
                    if (agent.role !== "bankAgent") return agent

                    query = "SELECT * FROM tblBankAgent WHERE id = $1"
                    const bankAgent = (await pool.query(query, [agent.id])).rows[0]

                    return {
                        ...agent,
                        bank: bankAgent.bank,
                        bankaddress: bankAgent.bankaddress,
                    }
                })
            )

            return res.status(200).json({
                status: true,
                message: "Successfully fetched agents",
                data: { agents },
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const updateAgentStatus = asyncHandler(async (req, res) => {
    try {
        const fieldsValidation = validateRequiredFields(["agentId"], req.body, res)

        const { agentId, isApproved } = req.body
        if (fieldsValidation) return fieldsValidation

        let query = "SELECT * FROM tblAgent WHERE id = $1 AND dealership = $2"
        const agent = (
            await pool.query(query, [agentId, req.tokenData.dealership.id])
        ).rows[0]

        if (!agent)
            return res.status(404).json({ status: false, message: "Agent not found" })

        query =
            "UPDATE tblUserProfile SET isApproved = $1, updatedAt = NOW() WHERE id = $2"
        await pool.query(query, [isApproved, agentId])
        return res
            .status(200)
            .json({ status: true, message: "Successfully updated agent status" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

//admin
const updateUserStatus = asyncHandler(async (req, res) => {
    try {
        const fieldsValidation = validateRequiredFields(["userId"], req.body, res)
        if (fieldsValidation) return fieldsValidation
        const { userId, isApproved } = req.body

        query =
            "UPDATE tblUserProfile SET isApproved = $1, updatedAt = NOW() WHERE id = $2 RETURNING *"
        const user = (await pool.query(query, [isApproved, userId])).rows[0]
        if (!user)
            return res.status(404).json({ status: false, message: "User not found" })

        return res
            .status(200)
            .json({ status: true, message: "Successfully updated user status" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: true, message: error.message })
    }
})

//--------------------
const requestDealershipManagerPrivilege = asyncHandler(async (req, res) => {
    // try {
    //     const now = new Date();
    //     await addDoc(requestCol, {
    //         requestType: 1,
    //         userId: req.tokenData.id,
    //         createdAt: now,
    //         updatedAt: now
    //     })
    //     return res.status(200).json({ message: "Successfully requested privilege" })
    // } catch (e) {
    //     console.log(e);
    //     return res.status(500).json({ message: e.message })
    // }
})

const getUsers = asyncHandler(async (req, res) => {
    try {
        let query = "SELECT * FROM tblUserProfile"
        const users = (await pool.query(query)).rows
        return res.status(200).json({
            status: true,
            message: " Successfully fetched users's profile data",
            data: { users },
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const assetLinks = asyncHandler(async (req, res) => {
    try {
        const assetlinksData = [
            {
                relation: ["delegate_permission/common.handle_all_urls"],
                target: {
                    namespace: "android_app",
                    package_name: "com.example.roadready",
                    sha256_cert_fingerprints: [
                        "64:38:49:3F:7B:57:C5:DB:2C:08:13:82:A3:A2:5A:17:90:6E:80:67:F5:C3:B9:01:F5:83:89:B5:7D:E6:64:E1",
                    ],
                },
            },
            {
                relation: ["delegate_permission/common.handle_all_urls"],
                target: {
                    namespace: "android_app",
                    package_name: "com.example.roadready.activity",
                    sha256_cert_fingerprints: [
                        "64:38:49:3F:7B:57:C5:DB:2C:08:13:82:A3:A2:5A:17:90:6E:80:67:F5:C3:B9:01:F5:83:89:B5:7D:E6:64:E1",
                    ],
                },
            },
            {
                relation: ["delegate_permission/common.handle_all_urls"],
                target: {
                    namespace: "android_app",
                    package_name: "com.example.roadready",
                    sha256_cert_fingerprints: [
                        "30:90:4F:98:26:2A:1B:54:7E:04:EB:63:52:F7:65:CA:4B:13:E7:6A:DD:0E:53:A3:5C:5B:56:93:74:CC:61:78",
                    ],
                },
            },
        ]

        res.setHeader("Content-Type", "application/json")
        res.status(200).send(assetlinksData)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
})

const generatePDF = async (application) => {
    const pdfData = {
        application,
    }

    const htmlPDF = new PuppeteerHTMLPDF()
    htmlPDF.setOptions({ format: "A4" })

    try {
        const html = await htmlPDF.readFile(
            path.resolve(__dirname, "../views/application.handlebars"),
            "utf-8"
        )
        const template = handlebars.compile(html)
        const content = template(pdfData)

        const pdfBuffer = await htmlPDF.create(content)
        return pdfBuffer
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    buyerRegister,
    managerRegister,
    agentRegister,
    login,
    authGoogle,
    authGoogleCallBack,

    getUserProfile,
    deleteUser,
    updateUserProfile,
    changePassword,
    getUserNotifications,
    deleteUserNotification,

    getDealership,
    getDealershipModeOfPayments,
    getDealershipListingApplications,
    getDealershipBankAgents,

    buyerCreateApplication,
    buyerGetListingApplications,

    createListing,
    deleteListing,
    updateListing,

    updateApplication,
    getBankAgentApplicants,
    updateRegistrationRequest,

    requestOTPCode,
    verifyOTP,
    getAgents,

    //dealershipManager
    updateAgentStatus,
    //admin
    updateUserStatus,
    // updateBuyerUserProfile,
    // updateDealerAgentUserProfile,

    requestDealershipManagerPrivilege,
    getListing,
    getUsers,

    assetLinks,
    generatePDF,
}