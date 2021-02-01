const express = require('express');
const mongoose = require('mongoose');
const Balance = require('.././models/Balance');
const Company = require('.././models/Company');
const router = express.Router();

router.post('/', async (req, res, next) => {

    // Kontrollitakse, kas ettevõte on olemas
    Company.findById(req.body.companyId)
        .then(company => {
            if (!company) {
                return res.status(404).json({
                    message: "Ettevõtet ei leitud"
                })
            }

            // Lisatakse bilanss
            const balance = new Balance({
                _id: new mongoose.Types.ObjectId(),
                companyId: req.body.companyId,
                cash: req.body.cash
            });
            return balance.save();
        })
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Andmed edukalt lisatud',
                createdBalance: {
                    _id: result._id,
                    companyId: result.companyId,
                    cash: result.cash
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});

// Päritakse konkreetne bilanss, pärast saab selle välja kuvada konkreetse ettevõtte all
router.get('/:balanceId', async (req, res) => {

    const id = req.params.balanceId;

    Balance.findById(id)
        .select('_id cash')
        .populate('companyId')
        .exec()
        .then(doc => {
            console.log("Bilanss andmebaasist", doc);
            if(doc) {
                res.status(200).json({
                    balance: doc
                })
            }
            else {
                res.status(404).json({
                    message: "Bilanssi ei leitud"
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;