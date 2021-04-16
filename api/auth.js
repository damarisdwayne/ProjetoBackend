const { authSecret } = require('../.env')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const signin = async (req, res) => {
        if (!req.body.email || !req.body.password) { //valida o email e senha
            return res.status(400).send('Informe usuário e senha!')
        }

        const user = await app.db('users') //obtem o usuário do bd
            .where({ email: req.body.email }) //email recebido no body da requisição
            .first() //pega um único usuário a partir do email

        if (!user) return res.status(400).send('Usuário não encontrado!') //quando o usuário não existe

        const isMatch = bcrypt.compareSync(req.body.password, user.password) //compara a senha e valida
        if (!isMatch) return res.status(401).send('Email/Senha inválidos!')

        const now = Math.floor(Date.now() / 1000) //data atual em segundos

        const payload = { //conteudo do token
            id: user.id,
            name: user.name,
            email: user.email,
            admin: user.admin,
            iat: now, //emitido em : ...
            exp: now + (60 * 60 * 24 * 3) //expiração
        }

        res.json({
            ...payload,
            token: jwt.encode(payload, authSecret) //gera o token e manda para o usuário
        })// precisa do authSecret para gerar o token
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null
        try {
            if (userData) {
                const token = jwt.decode(userData.token, authSecret)
                if (new Date(token.exp * 1000) > new Date()) { //verifica se o token ainda esta valido
                    return res.send(true)
                }
            }
        } catch (e) {
            // problema com o token
        }

        res.send(false)
    }

    return { signin, validateToken }
}