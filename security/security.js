import bcrypt from 'bcryptjs'


//Initial password

export const hashPassword = async (password) => {

    return new Promise((resolve, reject) => {

        //increase security

        bcrypt.genSalt(12, (err, salt) => {

            if (err) {
                reject(err)
            }

            bcrypt.hash(password, salt, (err, hash) => {

                if (err) {
                    reject(err)
                }

                resolve(hash)

            })

        })

    })

}

//confirm password

export const hasConfrimPassword = async (confirmPassowrd) => {

    return new Promise((resolve, reject) => {

        //increase security

        bcrypt.genSalt(12, (err, salt) => {

            if (err) {
                reject(err)
            }

            bcrypt.hash(confirmPassowrd, salt, (err, hash) => {

                if (err) {
                    reject(err)
                }

                resolve(hash)
            })
        })

    })

}

//OTP
export const hashOtp = async (otp) => {

    return new Promise((resolve, reject) => {


        //increase security
        bcrypt.genSalt(12, (err, salt) => {

            if (err) {
                reject(err)
            }

            bcrypt.hash(otp, salt, (err, hash) => {

                if (err) {
                    reject(err)
                }

                resolve(hash)

            })

        })


    })

}

//compare

export function comparePassword(password, userPassword) {

    return bcrypt.compare(password, userPassword)

}

export function compareOtp(otp, userOtp){
    return bcrypt.compare(otp, userOtp)
}