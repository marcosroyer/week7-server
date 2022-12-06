import UserModel from '../model/user.model'

async function attachCurrentUser(request, response, next) {
    try {
        const userData = request.auth
        const user = await UserModel.findById(userData._id, { passwordHash: 0 })

        if (!user) {
            return response.status(400).json({ msg: 'Usuário não encontrado' })
        }

        request.currentUser = user

        next()
    } catch (error) {
        console.log(error)
        return response.status(400).json(error)
    }
}

export default attachCurrentUser
