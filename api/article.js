const queries = require('./queries')

module.exports = app => {
    const { existsOrError } = app.api.validation

    const save = (req, res) => {
        const article = { ...req.body }
        if (req.params.id) article.id = req.params.id

        try {
            existsOrError(article.name, 'Nome não informado')
            existsOrError(article.description, 'Descrição não informada')
            existsOrError(article.categoryId, 'Categoria não informada')
            existsOrError(article.userId, 'Autor não informado')
            existsOrError(article.content, 'Conteúdo não informado')
        } catch (msg) {
            res.status(400).send(msg)
        }

        if (article.id) {
            app.db('articles')
                .update(article)
                .where({ id: article.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('articles')
                .insert(article)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => {
        try {
            const rowsDeleted = await app.db('articles') //retorna a quantidade de registros excluidos
                .where({ id: req.params.id }).del()

            try {
                existsOrError(rowsDeleted, 'Artigo não foi encontrado.')
            } catch (msg) { //Caso o id informado seja invalido ele retorna um erro 
                return res.status(400).send(msg)
            }

            res.status(204).send()
        } catch (msg) {
            res.status(500).send(msg)
        }
    }

    const limit = 10 // usado para paginação
    const get = async (req, res) => {
        const page = req.query.page || 1

        const result = await app.db('articles').count('id').first() //quantos registros tem para fazer paginação
        const count = parseInt(result.count) //converte a string para int e traz o resultado da quantide de registros

        app.db('articles')
            .select('id', 'name', 'description')
            .limit(limit).offset(page * limit - limit) //deslocamento para trazer os dados e saber a quantidade de paginas que irá ter de acordo com o "limit" de quantos conteudos por page definidos
            .then(articles => res.json({ data: articles, count, limit }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('articles')
            .where({ id: req.params.id })
            .first()
            .then(article => {
                article.content = article.content.toString() //converte o formato binário de content para string
                return res.json(article) //retorna o artigo pelo ID informado
            })
            .catch(err => res.status(500).send(err))
    }

    const getByCategory = async (req, res) => {
        const categoryId = req.params.id
        const page = req.query.page || 1  //recebe como parametro a pagina que o usuário quer receber
        const categories = await app.db.raw(queries.categoryWithChildren, categoryId) //pega todos os IDS das categorias parent and chlidren
        const ids = categories.rows.map(c => c.id) //array de ids de parent + childrens

        app.db({ a: 'articles', u: 'users' }) //consulta duas tabelas definindo apelidos (a and u) para obter os artigos
            .select('a.id', 'a.name', 'a.description', 'a.imageUrl', { author: 'u.name' })
            .limit(limit).offset(page * limit - limit) //paginação
            .whereRaw('?? = ??', ['u.id', 'a.userId']) //iguala as duas tabelas para encontrar o usuário autor do artigo
            .whereIn('categoryId', ids) //passa todos os ids que obteve da consulta
            .orderBy('a.id', 'desc')
            .then(articles => res.json(articles))
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getById, getByCategory }
}