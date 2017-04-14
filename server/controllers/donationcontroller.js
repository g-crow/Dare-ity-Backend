const keyPublishable = "pk_test_BN1prVDcCZgCOaRMmJ6IrCaF";
const keySecret = "sk_test_0UF8Em57PInn7CqspRGhmuu8";
const app = require("express")();
const stripe = require("stripe")(keySecret);
var bodyParser = require('body-parser');



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post("/save-stripe-token",(req, res) => {

  var token = req.body.token.id;
  var charge = stripe.charges.create({
  amount: req.body.pledge,
  currency: "usd",
  description: "Donation",
  source: token,
  }, function(err, charge) {
    var message;
      if (err){
        message = "Sorry, we're experiencing technical difficulties. Please try again."
      } else {
        message = "Thanks for your donation!";
      }
      return res.json(message);
      res.end();
  });
})
