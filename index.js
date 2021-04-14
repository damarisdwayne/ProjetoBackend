const app = require('express')()
const consign = require('consign')
const db = require('./Config/db')

app.db = db

consign()
    .then('./Config/middlewares.js')
    .then('./api/validation.js')
    .then('./api')
    .then('./Config/routes.js')
    .into(app)

app.listen(3000, () => {
    console.log('Backend executando ...')
})