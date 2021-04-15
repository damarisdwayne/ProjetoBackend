module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation // usou um destructing

    const save = (req, res) => {

        const category = { ...req.body }

        if (req.params.id) category.id = req.params.id // se vier os parametros na requisição o id,
        // os coloco em category.id

        // validações
        try {

            existsOrError(category.name, 'Nome não informado')
        } catch (msg) {
            return res.status(400).send(msg)
        }
        if (category.id) { // se category.id estiver setado, vou fazer update se não um insert
            app.db('categories')
                .update(category) // paramentos recebidos em vindos de {...req.body} - ver linha 5
                .where({ id: category.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('categories')
                .insert(category)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => { // fazer validações para saber se posso ou não remover uma categoria
        // se a categoria tiver subcategorias ou mesmo tiver um artigo não vai deixar
        // o usuário remover a categoria
        // o usuario tem que dissassociar essa categoria de todos artigos, tem que tirar de cada categoria filha
        try {
            existsOrError(req.params.id, ' Código da Categoria não informado')

            const subcategory = await app.db('categories') /// consulta ao banco de dados usando o await
                .where({ parentId: req.params.id })// se for uma subcategoria 
            notExistsOrError(subcategory, 'Categoria possui subcategorias') // se não existir ok, se não da erro

            const articles = await app.db('articles')
                .where({ categoryId: req.params.id })
            notExistsOrError(articles, 'Categoria possui articles')

            const rowsDeleted = await app.db('categories')
                .where({ id: req.params.id }).del()
            // se o resultado gerou uma quantidade de linhas excluídas
            existsOrError(rowsDeleted, 'Categoria não foi encontrada')
            res.status(204).send()
        } catch (msg) {
            res.status(400).send(msg)
        }
    }

    const withPath = categories => {
        const getParent = (categories, parentId) => { // quero pegar a categoria pai, recebo a lista de categorias(categories)
            const parent = categories.filter(parent => parent.id === parentId) // pra encontrar o pai da categoria filtramos da lista categories
            return parent.length ? parent[0] : null
        }

        const categoriesWithPath = categories.map(category => {
            let path = category.name
            let parent = getParent(categories, category.parentId)


            // haverá situações que não haverá parenty então ele será nulo e em getParent não ira encontrar retornando
            // null, ai irá parar de montar path

            while (parent) {
                path = `${parent.name} > ${path}`
                parent = getParent(categories, parent.parentId) // se o parent do parent retornar nulo ele sai 
                // mas se tiver valor continua no loop até chegar no nó que não tem pai
            }
            return { ...category, path }
        })

        categoriesWithPath.sort((a, b) => { // a vai ser uma categoria e b outra categoria
            if (a.path < b.path) return -1
            if (a.path > b.path) return 1
            return 0
        })

        return categoriesWithPath // ordenados pelo path, e não pelo id ou qualquer outra coisa        
    }

    const get = (req, res) => {
        app.db('categories')
            .then(categories => res.json(categories))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('categories')
            .where({ id: req.params.id })
            .first()
            .then(category => res.json(category))
            .catch(err => res.status(500).send(err))
    }

    const toTree = (categories, tree) => {
        if (!tree) tree = categories.filter(c => !c.parentId)
        tree = tree.map(parentNode => {
            const isChild = node => node.parentId == parentNode.id
            parentNode.chlidren = toTree(categories, categories.filter(isChild))
            return parentNode
        })
        return tree
    }

    const getTree = (req, res) => {
        app.db('categories')
            .then(categories => res.json(toTree(categories)))
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getById, getTree }
}