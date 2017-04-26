const Pledge = require('../models/pledge');
const keyPublishable = "pk_test_O127XMYBkWs2vpiyD7G9bS2g";
const keySecret = "sk_test_Q0OUXBuRmmuMKNQvi4qqDTwq";
const stripe = require("stripe")(keySecret);

const createPledge = function(req, res){
    const {
        pledger_id,
        broadcaster_id,
        dare_id,
        npo_id,
        user_dare_id,
        pledge_amount,
        to_refund
        } = req.body
        console.log(pledger_id, broadcaster_id, dare_id, npo_id, user_dare_id, pledge_amount, to_refund, 'look here')
    var pledge = new Pledge(pledger_id, broadcaster_id, dare_id, npo_id, user_dare_id, pledge_amount, to_refund)
    pledge.save((err, pledge) => err ? res.status(500).json(err) : res.json(pledge))
}

const createStripePledge = (req, res) => {
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
}

const fetchPledge = function(req, res) {
  const id = req.body.id
  Pledge.fetchPledge(id, (err, result) => {
    if (err) {
      res.status(400).json({success: false, message: err})
    } else {
      res.json({
                success: true,
                result: result
              });
    }
  })
}

const updatePledge = function(req, res) {
  const query = req.body;
  Pledge.updatePledge(query, (err, result) => {
    if (err) {
      res.status(400).json({success: false, message: err})
    } else {
      res.json({
              success: true,
              result: result
            });
    }
  })
}

module.exports = { createPledge, createStripePledge, fetchPledge, updatePledge }
