
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js').parseString;
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
    },

    //接受用户发来的流式数据
    getXMLAsync: (req)=>{
        return new Promise((resolve, reject) => {
            let xmlDate = '';
            req.on('data',data=>{  //buffer数据
                data = data.toString(); //字符串
                xmlDate += data;
            }).on('end',()=>{
                resolve(xmlDate)
            })
        })
    },
    //将xml数据转成js对象
    parseXMLAsync:(xmlData)=>{
        return new Promise((resolve, reject) => {
            xml2js(xmlData, {trim: true}, (err, data) => {
                if(!err){
                    resolve(data)
                }else{
                    reject('err')
                }
            })
        })
    },
    //将js对象中的数组干掉
    formatMessage: (jsData)=>{
        let message = {}
        if(typeof jsData === 'object'){
            let key,value;
            const keys = Object.keys(jsData);
            console.log(keys)
            for(let i=0; i< keys.length;i++){
                key = keys[i]
                value = jsData[key];
                if(value instanceof Array && value.length > 0){
                    message[key] = value[0]
                }
            }
        }
        return message;
    }
}