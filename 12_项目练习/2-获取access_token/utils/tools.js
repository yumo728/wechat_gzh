
const fs = require('fs');
const path = require('path');

const fillpath = path.join(__dirname,'./accessToken.txt');


module.exports = {
    writeFileAsync:(data)=>{
        return new Promise((resolve, reject) => {
            fs.writeFile(fillpath,JSON.stringify(data),err=>{
                if(!err){
                    resolve(data)
                }else{
                    reject('err')
                }
            })
        })
    }
}