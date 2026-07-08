require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is Running 🚀");
});

app.post("/crisp/webhook", async (req, res) => {
    try {
        console.log("Webhook Received");
        console.log(req.body);

        const body = req.body;

        const visitor = body.visitor || {};
        const session = body.session || {};

        const name = visitor.nickname || "Unknown";
        const email = visitor.email || "No Email";
        const phone = visitor.phone || "No Phone";
        const website = session.website || "Unknown";

        const message = {
            content:
                `🟢 **New Visitor**

👤 Name: ${name}
📧 Email: ${email}
📞 Phone: ${phone}
🌐 Website: ${website}`
        };

        await axios.post(process.env.DISCORD_WEBHOOK, message);

        res.status(200).json({
            success: true
        });

    } catch (err) {
        console.error(err.response?.data || err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.post("/visitor", async (req, res) => {
    try {
        const { page, referrer, userAgent } = req.body;

        await axios.post(process.env.DISCORD_WEBHOOK, {
            content:
                `🟢 **New Website Visitor**

🌐 Page: ${page}
🔗 Referrer: ${referrer || "Direct"}
💻 User Agent: ${userAgent}`
        });

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});