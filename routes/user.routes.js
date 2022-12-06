import express from 'express'
import TaskModel from '../model/task.model.js'
import UserModel from '../model/user.model.js'
import bcrypt from 'bcrypt'
import generateToken from '../config/jwt.config.js'
import isAuth from '../middlewares/isAuth.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js'
import isAdmin from '../middlewares/isAdmin.js'

const userRoute = express.Router()

const saltRounds = 10

//sign-up
userRoute.post('/sign-up', async (request, response) => {
    try {
        const { password } = request.body
        //verifica pré-requisitos da senha
        if (
            !password ||
            !password.match(
                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#!])[0-9a-zA-Z$*&@#!]{8,}$/
            )
        ) {
            return res.status(400).json({
                msg: 'Senha não tem os requisitos mínimos de segurança.',
            })
        }

        //gerar o salt
        const salt = await bcrypt.genSalt(saltRounds)
        //hashear senha
        const hashedPassword = await bcrypt.hash(password, salt)
        //criar o usuario com a senha hasheada
        const newUser = await UserModel.create({
            ...request.body,
            passwordHash: hashedPassword,
        })

        //delete a propriedade passwordHash do obj
        delete newUser._doc_passwordHash

        return response.status(201).json(newUser)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error.errors)
    }
})

userRoute.post('/login', async (request, response) => {
    try {
        const { email, password } = request.body
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return response.status(400).json({ msg: 'Usuário não encontrado' })
        }
        //comparar a senha enviada com a senha do db
        if (await bcrypt.compare(password, user.passwordHash)) {
            delete user._doc_passwordHash
            //criar o token
            const token = generateToken(user)
            return response.status(200).json({ user: user, token: token })
        } else {
            return response.status(401).json({ msg: 'Email ou senha errada!' })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(error.errors)
    }
})

userRoute.post(
    '/profile',
    isAuth,
    attachCurrentUser,
    async (request, response) => {
        try {
            return response.status(200).json(request.currentUser)
        } catch (error) {
            console.log(error)
            return res.status(500).json(error.errors)
        }
    }
)

//CREATE - MONGODB
userRoute.post('/create-user', async (req, res) => {
    try {
        const form = req.body

        //quer criar um documento dentro da sua collection -> .create()
        const newUser = await UserModel.create(form)

        return res.status(201).json(newUser)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error.errors)
    }
})

userRoute.get(
    '/all-users',
    isAuth,
    isAdmin,
    attachCurrentUser,
    async (request, response) => {
        try {
            const users = await UserModel.find({}, { passwordHash: 0 })

            return response.status(200).json(users)
        } catch (error) {
            console.log(error)
            return response.status(500).json(error.errors)
        }
    }
)

//GET ALL USERS
/* userRoute.get('/all-users', async (request, response) => {
    try {
        const users = await UserModel.find({}, { __v: 0, updatedAt: 0 })
            .sort({
                age: 1,
            })
            .limit(100)

        return response.status(200).json()
    } catch (error) {
        console.log(error)
        return response.status(500).json(error.errors)
    }
}) */

//GET ONE USER
userRoute.get('/oneUser/:id', async (req, res) => {
    try {
        const { id } = req.params

        // const user = await UserModel.find({_id: id})
        const user = await UserModel.findById(id).populate('tasks')

        if (!user) {
            return res.status(400).json({ msg: ' Usuário não encontrado!' })
        }

        return res.status(200).json(user)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error.errors)
    }
})

userRoute.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params

        const deletedUser = await UserModel.findByIdAndDelete(id)

        if (!deletedUser) {
            return res.status(400).json({ msg: 'Usuário não encontrado!' })
        }

        const users = await UserModel.find()

        //deletar TODAS as tarefas que o usuário é dono
        await TaskModel.deleteMany({ user: id })

        return res.status(200).json(users)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error.errors)
    }
})

userRoute.put('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params

        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        )

        return res.status(200).json(updatedUser)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error.errors)
    }
})

export default userRoute
