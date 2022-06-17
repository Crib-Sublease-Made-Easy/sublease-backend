// app.js

const express = require('express');
const connectDB = require('./config/db');
const app = express();
require("dotenv").config();


//connect database
connectDB();


app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
  });

  


//routes
app.get('/', (req, res) => res.send('Hello World'));

const properties = require('./routes/controller/properties')
app.use('/properties', properties);

const users = require('./routes/controller/users')
app.use('/users', users);



const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server is running on port ${port}`));

