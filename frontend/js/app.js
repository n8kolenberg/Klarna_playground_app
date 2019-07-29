let vm = new Vue({
    el: "#app",
    data: {
        message: "Hello Vue1",
        clientToken: "",
        authToken: "",
        payment_method_categories: "",
        userData: {
            "billing_address" : {
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
            let options = {
                url: "http://localhost:1818/create-session",
                method: "post",
                data: this.userData
            }
            axios(options)
            .then((response)=>{
                console.log(`Front End request went through successfully!`);
                console.log(response);
                //Storing the client_token and payment_method_categories in our data
                this.clientToken = response.data.client_token;
                this.payment_method_categories = response.data.payment_method_categories;
            })
            .catch((error) => {
                console.log(`Front End request went wrong:`);
                console.log(error);
            });
        },

        authorize() {
            let vm = this;
            Klarna.Payments.authorize({
                payment_method_category: this.payment_method_categories[0]['identifier']
            }, vm.userData, 
            (res) => {
                console.log(res);
                res.approved ? vm.authToken = res.authorization_token : console.log("Something gone wrong with authorization of purchase");
            }); 
        }
    },

    watch: {
        clientToken() {
            Klarna.Payments.init({
                client_token: this.clientToken 
            })
            Klarna.Payments.load({
                container: '#klarna-container',
                payment_method_category: 'pay_later'
            }, (response) => {
                console.log("Payment widget should be loaded now")
                console.log(response);
                });
            
        }
       
    }
});