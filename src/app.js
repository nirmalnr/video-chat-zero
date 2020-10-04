const path = require('path')
const express = require('express')

const app = express()
const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.json())
app.use(express.static(publicDirectoryPath))

module.exports = app