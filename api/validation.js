module.exports = app => {
    function existsOrError(value, msg) { //se não existir da erro
        if (!value) throw msg
        if (Array.isArray(value) && value.length === 0) throw msg
        if (typeof value === 'string' && !value.trim()) throw msg // testa se é string e se esta vazia
    }


    function notExistsOrError(value, msg) { //se existir da erro
        try {
            existsOrError(value, msg)
        } catch (msg) {
            return msg
        }
        throw msg
    }

    function esqualOrError(valueA, valueB, msg) { //se não for igual da erro
        if (valueA !== valueB) throw msg
    }

    return { existsOrError, notExistsOrError, esqualOrError }
}