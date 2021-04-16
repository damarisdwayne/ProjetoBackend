module.exports = middleware => {
    return (req, res, next) => { //verifica se o user é administrador
        if (req.user.admin) {
            middleware(req, res, next)
        } else {
            res.status(401).send('Usuário não é administrador.')
        }
    }
}