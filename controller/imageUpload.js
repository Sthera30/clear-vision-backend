import cloudinary from 'cloudinary'

cloudinary.config({

    cloud_name: "dqbfnwwcc",
    api_key: "284248917451974",
    api_secret: "5hwDbuNlebjG4rYLz5jTNpAwsm4"

})


export const uploadImage = async (req, res) => {

    try {

        const result = await cloudinary.uploader.upload(req.files.image.path)

        res.json({

            url: result.secure_url,
            public_id: result.public_id

        })

    } catch (error) {
        console.log(error);

    }

}