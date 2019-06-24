var fs = require('fs');
var pth = require('path');
var request = require('request');
var config = require('../scripts/config.json')

var myfilepath = "/home/anish/node-elastic/file";

fs.readdir(myfilepath, (err,files) => {
    if(err){
        console.error("Could not list directory",err);
        process.exit(1);
    }
    files.forEach( (file,idx) => {
        var options = {
            method:'POST',
            uri:'config.local',
            formData:{
                textfiles:{
                    value: fs.createReadStream(pth.join(myfilepath,file)),
                    options:{
                        filename:file,
                        contentType:'text/pdf'
                    }
                }
            }
        };

        request(options, (err,res,body) => {
            if(err){
                console.log(err);
            }
            console.log(res);
        })

    })
})
