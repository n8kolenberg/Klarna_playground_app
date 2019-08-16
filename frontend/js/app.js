let vm = new Vue({
    el: "#app",
    data: {
        clientToken: "",
        authToken: "",
        payment_method_categories: "",
        pmcIdentifiers: [],
        order_id: "",
        authorized_payment_method: "",
        payment_methods_loaded: false,
        klarnaResponse: "",
        jsonUserData: {},
        malformedJSON: false,
        malformedJSONError: "",
        singleSourceOfTruthData: {},
        userData: { 
            "billing_address": {
                "given_name": "N8",
                "family_name": "Koli",
                "email": "n8koli@gmail.com",
                "title": "Mr",
                "street_address": "Kralingse Kerklaan 356",
                "postal_code": "3067 AX",
                "city": "Rotterdam",
                "phone": "728558765",
                "country": "NL"
            },
            "purchase_country": "nl",
            "purchase_currency": "EUR",
            "locale": "en-NL",
            "order_amount": 1000,
            "order_tax_amount": 0,
            "order_lines": [{
                "type": "physical",
                "reference": "19-402",
                "name": "Battery Power Pack",
                "quantity": 1,
                "unit_price": 1000,
                "tax_rate": 0,
                "total_amount": 1000,
                "total_discount_amount": 0,
                "total_tax_amount": 0
            }]
        }
    },

    methods: {
        createSession() {
            this.clearKlarnaResponse();
            let vm = this;

            let options = {
                url: "http://localhost:1818/create-session",
                method: "post",
                data: vm.userData
            };
            axios(options)
                .then((response) => {
                    console.log(`Front End request went through successfully!`);
                    console.log(response);
                    vm.klarnaResponse = response;
                    //Reset the PaymentMethod Identifiers from last session:
                    vm.pmcIdentifiers = [];
                    //Storing the client_token and payment_method_categories + the identifiers + name + asset urls in our data
                    vm.clientToken = response.data.client_token;
                    vm.payment_method_categories = response.data.payment_method_categories;
                    vm.payment_method_categories.forEach((payment_method) => {
                        vm.pmcIdentifiers.push({
                            identifier: payment_method.identifier,
                            badge: payment_method.asset_urls.standard,
                            name: payment_method.name
                        });
                    });
                })
                .catch((error) => {
                    console.log(`Front End request went wrong:`);
                    console.log(error);
                    vm.klarnaResponse = error;
                });
        },

        authorize(identifier) {
            this.clearKlarnaResponse();
            let vm = this;
            Klarna.Payments.authorize({
                    payment_method_category: identifier
                }, vm.userData,
                (res) => {
                    //This function authorizes the user and should return the authorization_token, which is stored in the front end and provided to the backend in the placeOrder call
                    console.log(res);
                    if (res.approved) {
                        vm.authToken = res.authorization_token
                        //Once Klarna returns the auth token, we place the order with it
                        vm.placeOrder(vm.authToken);
                    } else {
                        console.log("Something gone wrong with authorization of purchase:");
                        console.log(res);
                    }
                });
        },

        placeOrder(authToken) {
            this.clearKlarnaResponse();
            //Send the authToken to the place-order route in the backend to place the order with Klarna and send back the response.
            let vm = this;
            let options = {
                url: "http://localhost:1818/place-order",
                method: "post",
                data: {
                    userData: vm.userData,
                    authToken: authToken
                }
            };
            axios(options)
                .then((response) => {
                    console.log("Frontend placeOrder went through successfully!");
                    console.log(response);
                    //Adding the successful order details to variables to be shown in frontend
                    vm.order_id = response.data.order_id;
                    vm.authorized_payment_method = response.data.authorized_payment_method.type;
                })
                .catch((error) => {
                    console.log("There's been an error with the Frontend placeOrder:");
                    console.log(error);
                    vm.klarnaResponse = error;
                });
        },

        loadKlarnaPaymentCategory(category) {
            Klarna.Payments.load({
                container: `#${category}`,
                payment_method_category: category
            }, (response) => {
                console.log("Payment widget should be loaded now");
                console.log(response);
                this.payment_methods_loaded = true;
            });
        },

        clearKlarnaResponse() {
            this.order_id = "";
        },

        resetUserJSONData() {
            this.jsonUserData = JSON.stringify(this.singleSourceOfTruthData, undefined, 4);
            this.malformedJSON = false;
        },

        syntaxHighlight(json) {
            if (typeof json != 'string') {
                 json = JSON.stringify(json, undefined, 4);
            }
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                let cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
     }

    },

    mounted() {
        //When vue instance is mounted, we stringify userData and store it in a temporary variable
        this.jsonUserData = JSON.stringify(this.userData, undefined, 4);
        this.singleSourceOfTruthData = this.userData;
    },


    watch: {
        //When this.clientToken changes after this.createSession is called, we initialize Klarna Payments, load the payment method category in the container
        clientToken() {
            Klarna.Payments.init({
                client_token: this.clientToken
            });

            //Setting timeout so that the containers load into the html and then we load the payment method categories in them
            //For each payment_method_category (pmc), we call the load function with the respective container
            setTimeout(() => {
                this.pmcIdentifiers.forEach((pmc) => {
                    this.loadKlarnaPaymentCategory(pmc.identifier);
                });

            }, 10)
        },

        /* Watch jsonUserData for changes to catch any malformed JSON issues and log them in the console (later in Alert)
            If all good, store them in userData so we can send that data in to the backend create KP session call */
        jsonUserData(newValue) {
            try {
                this.userData = JSON.parse(newValue);
                this.malformedJSON = false;
                
            } catch(err) {
                console.log(`seems to be invalid JSON: ${err}`);
                this.malformedJSON = true;
                this.malformedJSONError = err;
            } 
        }
    },


});