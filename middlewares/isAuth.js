import { expressjwt } from 'express-jwt'
import * as dotenv from 'dotenv'

dotenv.config()

export default expressjwt({
    secret: process.env.TOKEN_SIGN_SECRET,
    algorithms: ['HS256'],
})

//quando a requisição passar por este middleware
//será criada uma chave chamada request.auth => payload => _id, email, role
