const app = require('express')()
const consign = require('consign')

consign()
    .then('./Config/middlewares.js')
    .then('./api')
    .then('./Config/routes.js')
    .into(app)

app.listen(3000, () => {
    console.log('Backend executando ...')
})