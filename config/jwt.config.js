import jwt from 'jsonwebtoken'

function generateToken(user) {
    //user vem do DB
    const { _id, email, role } = user
    //assinatura
    const signature = process.env.TOKEN_SIGN_SECRET

    const expiration = '12h'

    //função que retorna token assinado
    //argumentos
    //  payload: info dentro do token
    //  assinatura: signature
    //  config: determino a expiration
    return jwt.sign({ _id, email, role }, signature, { expiresIn: expiration })
}

export default generateToken
