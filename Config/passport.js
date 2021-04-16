const { authSecret } = require('../.env')
const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt

module.exports = app => {
    const params = {
        secretOrKey: authSecret, //segredo para decodificar o token
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() //extrai o token do request e coloca na variável jwt
    }

    const strategy = new Strategy(params, (payload, done) => {
        app.db('users')
            .where({ id: payload.id }) //obtem o user pelo id
            .first()     //erro null, usuário
            .then(user => done(null, user ? { ...payload } : false)) // se o usuário estiver setado ele não retorna falso
            .catch(err => done(err, false))
    })

    passport.use(strategy)

    return {
        authenticate: () => passport.authenticate('jwt', { session: false }) //filtra as requisições que precisam passar pelo passport(user logado)
    }
}