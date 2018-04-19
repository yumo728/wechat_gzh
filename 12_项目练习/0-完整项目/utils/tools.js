const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname,'accessToken.txt');

module.exports = {
    writeFileAsync:(data)=>{
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath,JSON.stringify(data),err=>{  //注意路径和凭据的格式
                if(!err){
                    resolve(data)
                }else{
                    reject('err')
                }
            })
        })
    },

    readFileAsync:()=>{
        return new Promise((resolve, reject) => {
            fs.readFile(filePath,(err,data)=>{
                if(!err){
                    resolve(data)
                }else{
                    reject('err')
                }
            })
        })
    }
}