const express = require('express');
const app = express();
// const controller = require('./backend/controller');
const createSession = require('./backend/routes/create-session');
const placeOrder = require('./backend/routes/place-order');
const cors = require('./backend/cors');


require('dotenv').config();

//App settings
const port = process.env.PORT || 1818;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


//Routes
app.use('/create-session', createSession);
app.use('/place-order', placeOrder);


//Listen
app.listen(port, () => {
    console.log(`KP app listening on ${port}`);
});


module.exports = app;