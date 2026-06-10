import express from 'express'
import cors from 'cors'
import mysql from 'mysql2'
import { addAboutUs, addAppointment, addDoctor, addDoctorAvailability, addServices, authUser, change_password, getAboutUsById, getAllAboutUs, getAllAllUsers, getAllAppointments, getAllDoctor, getAllServices, getAppointmentById, getAppointmentByUser, getDocAvailabilityByName, getDocAvailabilityTimeByDocName, getDocProfilePic, getDoctorById, getServicesById, getUserInfoByEmail, getUserInfoById, loginUser, logout, register, removeAboutUs, removeDoctor, removeServices, searchAppointment, searchDoc, updateAboutUs, updateAppointment, updateDoctor, updateServices, updateUserAppointment, updateUserProfile, verifyEmail, verifyOtp } from './controller/user.controller.js'
import { uploadImage } from './controller/imageUpload.js'
import ExpressFormidable from 'express-formidable'
import cookieParser from 'cookie-parser'
import { protect } from './middleware/authentication_middleware.js'
import pool from './controller/db.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use(cookieParser())


app.use(cors({
    origin: 'https://clear-vision-frontend.vercel.app/',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

const PORT = process.env.PORT || 5000

//https://clear-vision-clinic-frontend.vercel.app

//handles file uploads, documents etc
app.post("/upload", ExpressFormidable({ maxFieldsSize: 5 * 2024 * 2024 }), uploadImage)

app.post("/register", register)
app.get("/getUser", protect, authUser)
app.post("/login", loginUser)
app.post("/logout", logout)
app.post("/addDoctor", addDoctor)
app.get("/getAllDoctor", getAllDoctor)
app.get("/getDoctorById", getDoctorById)
app.delete("/removeDoctor", removeDoctor)
app.put("/updateDoctor", updateDoctor)
app.post("/addDoctorAvailability", addDoctorAvailability)
app.post("/addServices", addServices)
app.get("/getAllServices", getAllServices)
app.get("/getServicesById", getServicesById)
app.delete("/removeServices", removeServices)
app.put("/updateServices", updateServices)
app.post("/addAboutUs", addAboutUs)
app.get("/getAllAboutUs", getAllAboutUs)
app.get("/getAboutUsById", getAboutUsById)
app.delete("/removeAboutUs", removeAboutUs)
app.put("/updateAboutUs", updateAboutUs)
app.get("/getDoctorAvailabilityByName", getDocAvailabilityByName)
app.get("/getDocAvailabilityTimeByDocName", getDocAvailabilityTimeByDocName)
app.post("/addAppointment", addAppointment)
app.get("/myAppointments", getAppointmentByUser)
app.get("/doctorProfilePic", getDocProfilePic)
app.get("/getAppointmentById", getAppointmentById)
app.put('/updateAppointment/:appointmentId', updateAppointment);
app.get('/getUserInfoByEmail', getUserInfoByEmail)
app.get("/getUserInfoById", getUserInfoById)
app.put("/updateUserProfile", updateUserProfile)
app.get("/getAllAppointments", getAllAppointments)
app.get("/getAllUsers", getAllAllUsers)
app.put("/updateUserAppointment", updateUserAppointment)
app.get("/doctorsSearch", searchDoc)
app.get("/usersSearch", searchAppointment)
app.post("/verifyEmail", verifyEmail)
app.post("/verifyOtp", verifyOtp)
app.put("/changePassword", change_password)

// NEW - FreeSQLdatabase
const db = mysql.createConnection({
    host: 'sql8.freesqldatabase.com',
    user: 'sql8830029',
    password: 'pILfevnvBB',
    database: 'sql8830029',
    port: 3306
})

// connect to the database
db.connect((err) => {
    if (err) {
        console.log("Failed to connect to the database!", err);
    }
    else {
        console.log("Connected to the database!");
    }
})

export { db }

app.listen(PORT, () => {
    console.log(`App is listening at port ${PORT}`)
})


 /*const db = mysql.createConnection({

    user: 'root',
    host: 'localhost',
    password: '',
    database: 'eyeTestingDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

//connect to the databse

db.connect((err) => {

    if (err) {
        console.log("Failed to connect to the database!", err);
    }
    else {
        console.log("Connected to the database!");
    }
})

export { db }

app.listen(PORT, () => {
    console.log(`App is listening at port ${PORT}`)
})

*/


/*pool.connect().then(() => console.log("Connected to PostgreSQL"))
    .catch(err => console.error('Connection error', err.stack));

app.get("/", (req, res) => {
    console.log("Hello!");
    res.send("Api is working...")
})

app.get('/favicon.ico', (req, res) => res.status(204).end());


const PORT = 5000;

app.listen((PORT), () => {
    console.log(`App is listening at port ${PORT}!`);
})

*/