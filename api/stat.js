module.exports = app => {
    const Stat = app.mongoose.model('Stat', { //model com mongo
        users: Number,
        categories: Number,
        articles: Number,
        createdAt: Date
    })

    const get = (req, res) => { //obtem as statisticas atualizadas
        Stat.findOne({}, {}, { sort: { 'createdAt': -1 } }) //pega a ultima statistica
            .then(stat => {
                const defaultStat = { //se a statistica obtida não for valida ele pega os dados aqui
                    users: 0,
                    categories: 0,
                    articles: 0
                }
                res.json(stat || defaultStat)
            })
    }

    return { Stat, get }
}