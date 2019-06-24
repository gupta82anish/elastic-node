var elasticsearch = require('elasticsearch');
var multer = require('multer');
var textract = require('textract');
var doc = require('../db/models').filedata;
var config = require('../config.json');
var paginate = require('express-paginate');


var client = elasticsearch.Client({
    host:config.elasticsearchpath,
    log: 'error'
});


var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, config.filepath);
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({ storage: Storage }).single("textfiles");

function initIndex(){
    client.indices.create({
        index:"resume"
    }).then(function(res){
    },function(err){
        console.log(err)
    })
}

function addtoIndex(text){
     return new Promise( (resolve, reject) => {
         client.index({
             index:"resume",
             type:"filename",
             body:{
                 "content":text
             }
         },(err,response,status) => {
             if(err){
                 reject(err);
                 return;
             }
             let docId = '';
             if(response.result =="created"){
                 docId = response._id;
             }
             resolve(docId);
         })
     });
}

function readFile(filepath){
        return new Promise( (resolve,reject) => {
                textract.fromFileWithPath(filepath,function(err,text){
                    if(err){
                        reject(err);
                        return;
                    }
                    resolve(text);

                })
        })
}


module.exports = {
      uploadFile(req,res){
                upload(req,res,function(err){
                if(err){
                    res.send(err);
                }
                var text = readFile(req.file.path);
                text.then( (txt) => {
                    var dId = addtoIndex(txt);
                    dId.then((docId) => {
                        doc.create({
                            link: req.file.path,
                            documentid: docId
                        }).then(success => res.send(success))
                        .catch(err => res.send(err))
                    }).catch(function(e){
                        console.log(e);
                    })
                })
                .catch( (e) => {
                    console.log(e);
                })
        })
    },
    search(req,res){
        client.search({
            index:"resume",
            type:"filename",
            body:{
                query:{
                        match:{
                            content:req.params.word
                        }
                }
            }
        },function(err,resp){
            if(err){
                console.log(err);
                res.send(err)
            }
            else{
                var hits = resp.hits.hits;
                var links = [];
                var itemCount,
                    pageCount,
                    pages
                var promisesArr = hits.map(function(hit){
                    return new Promise(function(resolve,reject){
                        doc.findAndCountAll({
                            limit:req.query.limit,
                            offset:req.skip,
                            attributes:['link','id','documentid'],
                            where:{
                                documentid: hit._id
                            },
                            raw:true
                        }).then( (results) => {
                            itemCount = links.length;
                            pageCount = Math.ceil(links.length / req.query.limit);
                            for(var row of results.rows){
                                links.push(row.link);
                            }
                            pages = paginate.getArrayPages(req)(15,pageCount,req.query.page);
                            resolve();
                        })
                        .catch(err => res.send(err))
                    })
                })
                Promise.all(promisesArr)
                    .then(function(){
                        res.send({
                            pages:pages,
                            total:links.length,
                            data:links
                        })
                    })
            }
        })
    }
}
