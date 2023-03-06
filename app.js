// app.js
const express = require("express");
const connectDB = require("./config");
const app = express();
// const cors = require('cors');


// connect database
connectDB();
app.use(express.json());

// const corsOptions = {origin: process.env.URL || '*', credentials: true};

// app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header(
            "Access-Control-Allow-Methods",
            "PUT, POST, PATCH, DELETE, GET"
        );
        return res.status(200).json({});
    }
    next();
});

//routes
app.get("/", (req, res) => res.send("Hello World"));

const properties = require("./api/routes/properties");
app.use("/properties", properties);

const users = require("./api/routes/users");
app.use("/users", users);

const tokens = require("./api/routes/token");
app.use("/tokens", tokens);

const autocomplete = require("./api/routes/autocomplete");
app.use("/autocomplete", autocomplete);

const notifications = require("./api/routes/notifications");
app.use("/notifications", notifications);

const contact = require("./api/routes/contact");
app.use("/contact", contact);

const website = require('./api/routes/website');
app.use('/web', website);

const web_users = require('./api/routes/web-users');
app.use("/website", web_users);

// const chat = require('./api/routes/chat')
// app.use('/chat', chat);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
