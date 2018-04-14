const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, './accessToken.txt')

module.exports = {
  writeFileAsync: (data) => {
    data = JSON.stringify(data)
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, (err) => {
        if (!err) {
          resolve()
        } else {
          reject(err)
        }
      })
    })
  }
}