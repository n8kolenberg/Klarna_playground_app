const config = require('./credentials');
const axios = require('axios');

//Create the digest
const createDigest = () => {
    return (new Buffer(`${config.kid}:${config.sharedsecret}`).toString('base64'));
}
//digest
let digest = createDigest();

//Here we'll need to create functions that perform the actual calls
module.exports = {
    createSession(payload, callback) {
        //options to send along in the request
        let options = {
            method: 'POST',
            url: `${config.endpoint}/payments/v1/sessions`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${digest}`
            },
            data: payload,
        };

        //Execute the request
        axios(options)
        .then((response)=> {
            console.log(`Create Session Request sent successfully through Backend. Session id: ${response.data.session_id}`);
            callback(response);
        })
        .catch((error) => {
            //Modifying the data so error response can be used by callback in the same way as success message
            let response = {}
            response.data = {"message": error.message, "request-payload": error.config.data};
            console.log(`Error with createSession request in Backend: ${error}`)
            callback(response);
        });
        
    },

    placeOrder(payload, callback) {
         //options to send along in the request
         let options = {
             method: 'POST',
             url: `${config.endpoint}/payments/v1/authorizations/${payload.authToken}/order`,
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Basic ${digest}`
             },
             data: payload.userData,
         };
 
         //Execute the request
         axios(options)
         .then((response)=> {
             console.log(`Place Order Request sent successfully through Backend. Order id: ${response.data.order_id}`);
             callback(response.data);
         })
         .catch((error) => {
             //Modifying the data so error response can be used by callback in the same way as success message
             let response = {}
             response.data = {"error": error};
             console.log(`Error with placeOrder request in Backend: ${error}`)
             callback(response);
         });
    }
};