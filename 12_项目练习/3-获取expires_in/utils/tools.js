
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
    },

    readFileAsync:()=>{
        return new Promise((resolve, reject) => {
            fs.readFile(fillpath,(err,data)=>{
                if(!err){
                    // console.log(data) //buffer数据
                    data = toString(data); //转成字符串
                    resolve(data)
                }else{
                    reject('err')
                }
            })
        })
    }
}