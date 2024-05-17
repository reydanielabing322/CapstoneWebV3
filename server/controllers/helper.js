const { supabase, pool } = require("../config/supabaseConfig")
const { v4: uuidv4 } = require("uuid")

function validateRequiredFields(fields, body, res) {
    for (const field of fields) {
        if (!body[field] || body[field].toString().trim().length === 0) {
            return res.status(400).json({ status: false, message: `${field} is required` });
        }
    }
    return null;
}


async function getBuyerApplications(user) {

    let query = `
            SELECT a.*
            FROM tblBuyerBankLoanApplication a
            LEFT JOIN tblUserProfile u ON a.buyer = u.id
            WHERE u.id = $1
        `;

    const buyerBankApplications = (await pool.query(query, [user.id])).rows

    buyerBankApplications.forEach(element => {
        element.applicationType = "bankLoan(buyerBankChoice)"
    });


    query = `
            SELECT a.*
            FROM tblDealershipBankLoanApplication a
            LEFT JOIN tblUserProfile u ON a.buyer = u.id
            WHERE u.id = $1
        `;

    const dealershipBankLoanApplications = (await pool.query(query, [user.id])).rows

    dealershipBankLoanApplications.forEach(element => {
        element.applicationType = "bankLoan(dealershipBankChoice)"
    });


    query = `
            SELECT a.*
            FROM tblinhouseFinanceApplication a
            LEFT JOIN tblUserProfile u ON a.buyer = u.id
            WHERE u.id = $1
        `;

    const inhouseFinanceApplications = (await pool.query(query, [user.id])).rows

    inhouseFinanceApplications.forEach(element => {
        element.applicationType = "inhouseFinance"
    });

    query = `
            SELECT a.*
            FROM tblcashApplication a
            LEFT JOIN tblUserProfile u ON a.buyer = u.id
            WHERE u.id = $1
        `;

    const cashApplications = (await pool.query(query, [user.id])).rows
    cashApplications.forEach(element => {
        element.applicationType = "cash"
    });

    let applications = [];
    applications.push(...buyerBankApplications);
    applications.push(...cashApplications);
    applications.push(...inhouseFinanceApplications);
    applications.push(...dealershipBankLoanApplications);
    return applications;
}

const getDealershipApplications = async (dealership) => {
    let query = `
        SELECT a.*
            FROM tblBuyerBankLoanApplication a
            LEFT JOIN tblListing l ON l.id = a.listing
            LEFT JOIN tblDealership d ON d.id = l.dealership
            WHERE d.id = $1;
        `;
    const buyerBankApplications = (await pool.query(query, [dealership.id])).rows
    buyerBankApplications.forEach(element => {
        element.applicationType = "bankLoan(buyerBankChoice)"
    });
    query = `
        SELECT a.*
            FROM tblInhouseFinanceApplication a
            LEFT JOIN tblListing l ON l.id = a.listing
            LEFT JOIN tblDealership d ON d.id = l.dealership
            WHERE d.id = $1;
        `;
    const inhouseFinanceApplications = (await pool.query(query, [dealership.id])).rows
    inhouseFinanceApplications.forEach(element => {
        element.applicationType = "inhouseFinance"
    });

    query = `
        SELECT a.*
            FROM tblCashApplication a
            LEFT JOIN tblListing l ON l.id = a.listing
            LEFT JOIN tblDealership d ON d.id = l.dealership
            WHERE d.id = $1;
        `;

    const cashApplications = (await pool.query(query, [dealership.id])).rows
    cashApplications.forEach(element => {
        element.applicationType = "cash"
    });

    query = `
        SELECT a.*
            FROM tblDealershipBankLoanApplication a
            LEFT JOIN tblListing l ON l.id = a.listing
            LEFT JOIN tblDealership d ON d.id = l.dealership
            WHERE d.id = $1;
        `;

    const dealershipBankLoanApplications = (await pool.query(query, [dealership.id])).rows
    dealershipBankLoanApplications.forEach(element => {
        element.applicationType = "bankLoan(dealershipBankChoice)"
    });

    let applications = [];
    applications.push(...buyerBankApplications);
    applications.push(...cashApplications);
    applications.push(...inhouseFinanceApplications);
    applications.push(...dealershipBankLoanApplications);
    return applications;
}

const uploadFile = async (file, path) => {
    const { data, error } =
        await supabase.storage
            .from(path)
            .upload(uuidv4(), file.buffer, {
                contentType: file.mimetype,
            })

    if (error)
        return error;

    return data;
}

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

module.exports = {
    validateRequiredFields,
    getBuyerApplications,
    getDealershipApplications,
    uploadFile,
    generatePassword,
}