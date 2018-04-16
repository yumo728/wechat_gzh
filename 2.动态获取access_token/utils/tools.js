const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname,'./accessToken.txt');

module.exports = {
    writeFileAsync:(data)=>{
        //创建promise对象
        return new Promise((resolve, reject) => {
            //fs文件系统的简单异步写入
            fs.writeFile(filePath,JSON.stringify(data),err=>{
                if(!err){
                    resolve(data);
                }else{
                    reject(err);
                }
            })
        })
    },
    readFileAsync:()=>{
        //创建promise对象
        return new Promise((resolve, reject) => {
            //fs文件系统的简单异步写入
            fs.readFile(filePath,(err,data)=>{
                if(!err){
                    // console.log(data)   //buffer数据
                    data = data.toString();  //转成字符串
                    resolve(data);
                }else{
                    reject(err);
                }
            })
        })
    }
}