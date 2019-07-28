const express = require('express');
const router = express.Router({mergeParams: true});
const controller = require('../controller');

router.use((req, res, next) => {
    console.log("routing in progress");
    next();
});

router.post('/', (req, res) => {
	//payload taken from frontend and comes through as req.body
	const payload = req.body;
    controller.createSession(payload, (response) => {
        //Here we're sending the response to the front end
        res.send(response.data);
        
    });
});

module.exports = router;