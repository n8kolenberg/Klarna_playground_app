require('dotenv').config();

module.exports = {
    "kid": process.env.USERNAME,
	"sharedsecret": process.env.PASSWORD,
	"endpoint": "https://api.playground.klarna.com/"
}