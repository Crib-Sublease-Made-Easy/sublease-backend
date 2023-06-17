// app.js
const express = require("express");
const connectDB = require("./config");
const app = express();
var bodyParser = require('body-parser');


// connect database
connectDB();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());



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
// app.get("/", (req, res) => res.send("Hello World"));
app.get("/", (req, res) => res.writeHead(301, { Location: `https://www.google.com`}).end());

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

const payments = require('./api/routes/payments');
app.use('/payments', payments);

const web_users = require('./api/routes/web-users');
app.use("/website", web_users);

const automation = require('./api/routes/automation');
app.use('/automation', automation);

const subtenants = require('./api/routes/subtenants');
app.use('/subtenants', subtenants);

const requests = require('./api/routes/requests');
app.use('/requests', requests);

const id_image = require('./api/routes/id_image');
app.use('/id_image', id_image);
// const chat = require('./api/routes/chat')
// app.use('/chat', chat);



const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server is running on port ${port}`));
