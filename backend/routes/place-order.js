const express = require('express');
const router = express.Router({mergeParams: true});
const controller = require('../controller')

router.use((req, res, next) => {
    console.log("routing in progress");
    next();
});

router.post('/', (req, res)=>{
//payload from the frontend should now include the authorization_token
    let payload = req.body;
    controller.placeOrder(payload, (response)=> {
        //Sending the response to the frontend
        res.send(response);
    });
});

module.exports = router;