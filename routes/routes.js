var express = require('express');
var router = express.Router();
var paginate = require('express-paginate')
const controller = require('../controllers').controller;

module.exports = (app) => {

    app.use(paginate.middleware(10,50));

    app.get('/api',(req,res)=>{
        res.status(200).send({
            message:'Elastic Search Running'
        })
    })

    // router.route('/elastic').post(controller.);
    router.route('/upload').post(controller.uploadFile);
    router.route('/search/:word').get(controller.search);

    app.use('/',router)
}
