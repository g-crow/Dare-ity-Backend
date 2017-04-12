const Dare = require ('../models/dare');

const createDare = function(req, res){
	const {
			title,
			description,
			npo_creator,
			expiration,
			pledge_threshold
		  } = req.body;
	var dare = new Dare(title, description, npo_creator, expiration, pledge_threshold)
    dare.save((err, dare) => err ? res.status(500).json(err) : res.json(dare))
}

const fetchDare = function(req, res) {
	const { query } = req.body;
  Dare.fetchDare(query, (err, result) => {
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

module.exports = { createDare, fetchDare };
