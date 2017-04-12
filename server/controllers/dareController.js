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


module.exports = { createDare };