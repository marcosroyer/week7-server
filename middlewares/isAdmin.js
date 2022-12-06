function isAdmin(request, response, next) {
    if (request.auth.role !== 'ADMIN') {
        response
            .status(401)
            .json({ msg: 'Usuário não autorizado para esta rota!' })
    }
    next()
}

export default isAdmin
