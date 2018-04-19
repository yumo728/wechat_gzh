const express = require('express');
const sha1 = require('sha1');
const app = express();

const config = {
    token:'myumoWANG1634'
}

app.use((req,res)=>{
    console.log(req.query)

    /*
        { signature: '09bd6e2934d44f9f0220bc3aa7ffdaab444f839f',
        echostr: '13117983872536543082',
        timestamp: '1524100928',
        nonce: '2790241080' }
    */

    const signature = req.query.signature;
    const echostr = req.query.echostr;
    const timestamp = req.query.timestamp;
    const nonce = req.query.nonce;
    const token = config.token;


    /*const arr = [timestamp,nonce,token].sort();
    console.log('arr:'+arr);

    const shastr = sha1(arr.join(''));
    console.log('shastr:'+shastr)*/

    const shastr = sha1([timestamp,nonce,token].sort().join(''));
    console.log(shastr)

    if(shastr === signature){
        res.send(echostr)
    }else{
        res.send('err')
    }

})

app.listen(3000, ()=> {
    console.log('服务器启动成功了')
});
