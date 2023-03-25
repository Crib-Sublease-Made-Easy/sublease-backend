const fetch = require('node-fetch');

var sq_access_token = process.env.SQUARE_ACCESS_TOKEN;




//************************* PAYMENTS CONTROLLER ***************************//

var data = {
	"quick_pay":{
		"name": "Crib Premium",
		"price_money": {
			"amount": 100,
			"currency": "USD"
		},
		"location_id": "LGZXV3FXE9F2J"

	}
}

// @route POST /payments/premium/generatelink
// @description generate payment link
// @access Private
exports.prem_generate_link = (req, res, next) => {
    fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Square-Version': '2023-03-15',
            'Authorization': 'Bearer ' + sq_access_token
        }, 
        body: JSON.stringify(data)
      }).then(resp => resp.json())
      .then(json => res.json(json))
      .catch(err => res.status(400).json({ error: 'unable to make request', errRaw: err }));


};