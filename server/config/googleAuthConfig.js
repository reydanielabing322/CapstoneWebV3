const { google } = require("googleapis")

const oAuth2Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: [
        process.env.node_env == "dev"
            ? "http://localhost:6969/auth/google/callback"
            : "https://road-ready-backend.vercel.app/auth/google/callback",
    ],
})

const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

module.exports = {
    oAuth2Client,
    scopes,
}
