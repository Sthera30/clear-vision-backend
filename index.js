import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mysql from 'mysql2'
import { addAboutUs, addAppointment, addDoctor, addDoctorAvailability, addServices, authUser, change_password, getAboutUsById, getAllAboutUs, getAllAllUsers, getAllAppointments, getAllDoctor, getAllServices, getAppointmentById, getAppointmentByUser, getDocAvailabilityByName, getDocAvailabilityTimeByDocName, getDocProfilePic, getDoctorById, getServicesById, getUserInfoByEmail, getUserInfoById, loginUser, logout, register, removeAboutUs, removeDoctor, removeServices, searchAppointment, searchDoc, updateAboutUs, updateAppointment, updateDoctor, updateServices, updateUserAppointment, updateUserProfile, verifyEmail, verifyOtp } from './controller/user.controller.js'
import { uploadImage } from './controller/imageUpload.js'
import ExpressFormidable from 'express-formidable'
import cookieParser from 'cookie-parser'
import { protect } from './middleware/authentication_middleware.js'

const app = express()

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use(cookieParser())


app.use(cors({
    origin: 'https://clear-vision-frontend.vercel.app',
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

// TiDB Cloud connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true
})

// check the connection works
db.getConnection((err, connection) => {
    if (err) {
        console.log("Failed to connect to the database!", err)
    } else {
        console.log("Connected to the database!")
        connection.release()
    }
})

export { db }


 