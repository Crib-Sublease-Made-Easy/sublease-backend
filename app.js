// app.js

const express = require('express');
const connectDB = require('./config/db');
const app = express();


//connect database
connectDB();


app.use(express.json());

//routes
app.get('/', (req, res) => res.send('Hello World'));

const properties = require('./routes/controller/properties')
app.use('/properties', properties);

const users = require('./routes/controller/users')
app.use('/users', users);



const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server is running on port ${port}`));

