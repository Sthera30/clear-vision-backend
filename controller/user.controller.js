import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { hashPassword, hasConfrimPassword, comparePassword, hashOtp, compareOtp } from '../security/security.js'
import nodemailer from 'nodemailer'
import genOTP from 'otp-generator'
import pool from './db.js'
import { db } from '../index.js'


export const register = async (req, res) => {

    const {
        profilePicture, fullName, lastName, email, telNo,
        addressLine1, addressLine2, gender, role, dob,
        password, confirmPassword
    } = req.body;

    try {

        if (!fullName || !lastName || !email || !telNo ||
            !addressLine1 || !gender || !dob ||
            !password || password.length < 6 ||
            !confirmPassword || confirmPassword.length < 6 ||
            password !== confirmPassword) {

            return res.status(200).json({ error: 'All fields are required and passwords must match!', success: false });
        }

        const checkEmailExists = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM users WHERE email = ?";

                db.query(sql, [email], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await checkEmailExists();

        if (results.length > 0) {
            return res.status(200).json({ error: 'Email already exists!', success: false });
        }

        const hashPass = await hashPassword(password);
        const hashConfirmPass = await hasConfrimPassword(confirmPassword);

        const createUser = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    INSERT INTO users (
                        profilePicture, fullName, lastName, email,
                        telNo, addressLine1, addressLine2, gender,
                        role, dob, password, confirmPassword
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(sql, [
                    profilePicture, fullName, lastName, email,
                    telNo, addressLine1, addressLine2, gender,
                    'user', dob, hashPass, hashConfirmPass
                ], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await createUser();

        const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        return res.status(200).json({
            message: 'Successfully registered!',
            success: true,
            data: { token }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to register', success: false });
    }
};

export const authUser = async (req, res) => {

    try {

        const getUser = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM users WHERE email = ?";

                db.query(sql, [req.user.email], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await getUser();

        if (rows.length === 0) {
            return res.status(200).json({ error: 'User not found!', success: false });
        }

        return res.status(200).json({
            message: 'User Found!',
            success: true,
            data: { user: rows[0] }
        });

    } catch (error) {
        console.error("Error authenticating user:", error);
        return res.status(200).json({ error: 'Failed Authenticating User!', success: false });
    }
};

export const loginUser = async (req, res) => {

    const { password, email } = req.body;

    try {

        if (!email || !password) {
            return res.status(200).json({ error: 'Email and Password are required!', success: false });
        }

        const getUser = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM users WHERE email = ?";

                db.query(sql, [email], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await getUser();

        if (rows.length === 0) {
            return res.status(200).json({ error: 'Invalid login details!', success: false });
        }

        const user = rows[0];

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(200).json({ error: 'Wrong Password!', success: false });
        }

        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        return res.status(200).json({
            message: 'logged in successfully',
            success: true,
            data: { user, token }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error!', success: false });
    }
};

export const logout = async (req, res) => {

    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        });

        return res.status(200).json({
            message: 'logged out successfully',
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Logout failed!', success: false });
    }
};


export const addDoctor = async (req, res) => {

    const {
        profilePicture, doctorName, doctorEmail, doctorExperience, doctorFee,
        doctoraddressLine1, doctorQualification, doctorSpeciality,
        doctoraddressLine2, aboutDoctor, password, confirmPassword
    } = req.body;

    try {

        if (!doctorName || !doctorEmail || !doctorExperience || !doctorFee ||
            !doctoraddressLine1 || !doctorQualification || !doctorSpeciality ||
            !aboutDoctor || !password || password.length < 6 ||
            !confirmPassword || confirmPassword.length < 6 ||
            password !== confirmPassword) {

            return res.status(200).json({ error: 'All fields are required and passwords must match!', success: false });
        }

        const checkEmailExists = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM doctor WHERE doctoremail = ?";
                db.query(sql, [doctorEmail], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const emailResults = await checkEmailExists();

        if (emailResults.length > 0) {
            return res.status(200).json({ error: 'Doctor email already exists!', success: false });
        }

        const hashDoctorPassword = await hashPassword(password);
        const hashConfirmDoctorPassword = await hasConfrimPassword(confirmPassword);

        const createDoctor = () => {
            return new Promise((resolve, reject) => {

                const sql = `INSERT INTO doctor (
                    profilePicture, doctorName, doctorEmail, doctorExperience,
                    doctorFee, doctoraddressLine1, doctorQualification,
                    doctorSpeciality, doctoraddressLine2, aboutDoctor,
                    password, confirmPassword
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                db.query(sql, [
                    profilePicture, doctorName, doctorEmail, doctorExperience,
                    doctorFee, doctoraddressLine1, doctorQualification,
                    doctorSpeciality, doctoraddressLine2, aboutDoctor,
                    hashDoctorPassword, hashConfirmDoctorPassword
                ], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await createDoctor();

        return res.status(200).json({
            message: 'Successfully added doctor!',
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to add doctor', success: false });
    }
};


export const getAllDoctor = async (req, res) => {

    try {

        const getDoctors = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM doctor";
                db.query(sql, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const doctors = await getDoctors();

        if (doctors.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        return res.status(200).json({
            message: '',
            success: true,
            data: { doctors }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to fetch doctors', success: false });
    }
};


//

export const getDoctorById = async (req, res) => {

    const { id } = req.query;

    try {

        const fetchDoctor = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM doctor WHERE id = ?";
                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await fetchDoctor();

        if (results.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        return res.status(200).json({
            message: '',
            success: true,
            data: {
                doctor: results[0]
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to get doctor by ID', success: false });
    }
};

export const removeDoctor = async (req, res) => {

    const { id } = req.query;

    try {

        const deleteDoctor = () => {
            return new Promise((resolve, reject) => {

                const sql = "DELETE FROM doctor WHERE id = ?";
                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const result = await deleteDoctor();

        if (result.affectedRows === 0) {
            return res.status(200).json({ error: 'No changes were made!', success: false });
        }

        return res.status(200).json({ message: 'Deleted successfully!', success: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to delete doctor', success: false });
    }
};

export const updateDoctor = async (req, res) => {

    const {
        id, profilePicture, doctorName, doctorEmail, doctorExperience,
        doctorFee, doctoraddressLine1, doctorQualification,
        doctorSpeciality, doctoraddressLine2, aboutDoctor,
        password, confirmPassword
    } = req.body;

    try {

        if (!doctorName || !doctorEmail || !doctorExperience || !doctorFee ||
            !doctoraddressLine1 || !doctorQualification || !doctorSpeciality || !aboutDoctor) {

            return res.status(200).json({ error: 'All required fields must be filled', success: false });
        }

        const findDoctor = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM doctor WHERE id = ?";
                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await findDoctor();

        if (results.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        const doctor = results[0];

        const updateDoctorSql = () => {
            return new Promise((resolve, reject) => {

                const sql = `UPDATE doctor SET 
                    profilePicture = ?, doctorName = ?, doctorEmail = ?, doctorExperience = ?,
                    doctorFee = ?, doctoraddressLine1 = ?, doctorQualification = ?, doctorSpeciality = ?,
                    doctoraddressLine2 = ?, aboutDoctor = ?, password = ?, confirmPassword = ?
                    WHERE id = ?`;

                db.query(sql, [
                    profilePicture || doctor.profilePicture,
                    doctorName || doctor.doctorName,
                    doctorEmail || doctor.doctorEmail,
                    doctorExperience || doctor.doctorExperience,
                    doctorFee || doctor.doctorFee,
                    doctoraddressLine1 || doctor.doctoraddressLine1,
                    doctorQualification || doctor.doctorQualification,
                    doctorSpeciality || doctor.doctorSpeciality,
                    doctoraddressLine2 || doctor.doctoraddressLine2,
                    aboutDoctor || doctor.aboutDoctor,
                    password || doctor.password,
                    confirmPassword || doctor.confirmPassword,
                    id
                ], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const result = await updateDoctorSql();

        if (result.affectedRows === 0) {
            return res.status(200).json({ error: 'No changes were made!', success: false });
        }

        return res.status(200).json({
            message: 'Updated successfully',
            success: true,
            data: {
                id,
                profilePicture: profilePicture || doctor.profilePicture,
                doctorName: doctorName || doctor.doctorName,
                doctorEmail: doctorEmail || doctor.doctorEmail,
                doctorExperience: doctorExperience || doctor.doctorExperience,
                doctorFee: doctorFee || doctor.doctorFee,
                doctoraddressLine1: doctoraddressLine1 || doctor.doctoraddressLine1,
                doctorQualification: doctorQualification || doctor.doctorQualification,
                doctorSpeciality: doctorSpeciality || doctor.doctorSpeciality,
                doctoraddressLine2: doctoraddressLine2 || doctor.doctoraddressLine2,
                aboutDoctor: aboutDoctor || doctor.aboutDoctor,
                password: password || doctor.password,
                confirmPassword: confirmPassword || doctor.confirmPassword,
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to update doctor', success: false });
    }
};

// Book an appointment as a user

export const addDoctorAvailability = async (req, res) => {

    const { entries } = req.body;

    try {

        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({ error: 'No availability entries provided', success: false });
        }

        const invalidEntries = entries.filter(entry =>
            !entry.doctorName || !entry.Date || !entry.availableStatus
        );

        if (invalidEntries.length > 0) {
            return res.status(400).json({
                error: 'Invalid entries',
                success: false,
                invalidEntries
            });
        }

        const values = entries.map(entry => [
            entry.doctorName,
            entry.Date,
            entry.timeSlot || null,
            entry.availableStatus
        ]);

        // MySQL placeholders (?, ?, ?, ?), (?, ?, ?, ?)
        const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");

        const flatValues = values.flat();

        const insertAvailability = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    INSERT INTO doctorAvailability (doctorName, Date, timeSlot, availableStatus)
                    VALUES ${placeholders}
                `;

                db.query(sql, flatValues, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const result = await insertAvailability();

        return res.status(200).json({
            message: `Successfully added ${result.affectedRows} availability entries`,
            success: true,
            insertedCount: result.affectedRows
        });

    } catch (error) {
        console.error('Unhandled error in addDoctorAvailability:', error);
        return res.status(500).json({
            error: 'Internal server error',
            success: false,
            details: error.message
        });
    }
};

export const addServices = async (req, res) => {

    const { profilePicture, serviceHeading, serviceDescription } = req.body;

    try {

        if (!profilePicture || !serviceHeading || !serviceDescription) {
            return res.status(400).json({ error: 'All fields are required!', success: false });
        }

        const createService = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    INSERT INTO services (profilePicture, serviceHeading, serviceDescription)
                    VALUES (?, ?, ?)
                `;

                db.query(sql, [profilePicture, serviceHeading, serviceDescription], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await createService();

        return res.status(200).json({
            message: 'Successfully added!',
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const getAllServices = async (req, res) => {

    try {

        const fetchServices = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM services";

                db.query(sql, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await fetchServices();

        if (results.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        return res.status(200).json({
            success: true,
            data: {
                services: results
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const getServicesById = async (req, res) => {

    const { id } = req.query;

    try {

        const fetchServiceById = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM services WHERE id = ?";

                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await fetchServiceById();

        if (results.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        return res.status(200).json({
            success: true,
            data: {
                services: results[0]
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const removeServices = async (req, res) => {

    const { id } = req.query;

    try {

        const deleteService = () => {
            return new Promise((resolve, reject) => {

                const sql = "DELETE FROM services WHERE id = ?";

                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const result = await deleteService();

        if (result.affectedRows === 0) {
            return res.status(200).json({ error: 'No changes were made!', success: false });
        }

        return res.status(200).json({
            message: 'Deleted successfully!',
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const updateServices = async (req, res) => {

    const { id, profilePicture, serviceHeading, serviceDescription } = req.body;

    try {

        if (!profilePicture || !serviceHeading || !serviceDescription) {
            return res.status(400).json({ error: 'All fields are required!', success: false });
        }

        const findService = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM services WHERE id = ?";

                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await findService();

        if (results.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        const updateService = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    UPDATE services
                    SET profilePicture = ?, serviceHeading = ?, serviceDescription = ?
                    WHERE id = ?
                `;

                db.query(sql, [profilePicture, serviceHeading, serviceDescription, id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const result = await updateService();

        if (result.affectedRows === 0) {
            return res.status(200).json({ error: 'No changes were made!', success: false });
        }

        return res.status(200).json({
            message: 'Updated successfully',
            success: true,
            data: { id, profilePicture, serviceHeading, serviceDescription }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error', success: false });
    }
};


export const addAboutUs = async (req, res) => {

    const { profilePicture, aboutUsHeading, aboutUsDescription } = req.body;

    try {

        if (!profilePicture || !aboutUsHeading || !aboutUsDescription) {
            return res.status(400).json({ error: 'All fields are required!', success: false });
        }

        const createAbout = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    INSERT INTO aboutUs (profilePicture, aboutUsHeading, aboutUsDescription)
                    VALUES (?, ?, ?)
                `;

                db.query(sql, [profilePicture, aboutUsHeading, aboutUsDescription], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await createAbout();

        return res.status(200).json({
            message: 'Successfully added!',
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error', success: false });
    }
};


export const getAllAboutUs = async (req, res) => {

    try {

        const fetchAbout = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM aboutUs";

                db.query(sql, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await fetchAbout();

        return res.status(200).json({
            message: '',
            success: true,
            data: { aboutUs: results }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error', success: false });
    }
};

export const getAboutUsById = async (req, res) => {

    const { id } = req.query;

    try {

        const fetchById = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM aboutUs WHERE id = ?";

                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await fetchById();

        if (results.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        return res.status(200).json({
            message: '',
            success: true,
            data: { aboutUs: results[0] }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error', success: false });
    }
};



export const removeAboutUs = async (req, res) => {

    const { id } = req.query;

    try {

        const deleteAbout = () => {
            return new Promise((resolve, reject) => {

                const sql = "DELETE FROM aboutUs WHERE id = ?";

                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const result = await deleteAbout();

        if (result.affectedRows === 0) {
            return res.status(200).json({ error: 'No changes were made!', success: false });
        }

        return res.status(200).json({
            message: 'Deleted successfully!',
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error', success: false });
    }
};

export const updateAboutUs = async (req, res) => {

    const { id, profilePicture, aboutUsHeading, aboutUsDescription } = req.body;

    try {

        if (!profilePicture || !aboutUsHeading || !aboutUsDescription) {
            return res.status(200).json({ error: 'All fields are required!', success: false });
        }

        const findAbout = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM aboutUs WHERE id = ?";

                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await findAbout();

        if (results.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        const existing = results[0];

        const updateAbout = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    UPDATE aboutUs 
                    SET profilePicture = ?, aboutUsHeading = ?, aboutUsDescription = ?
                    WHERE id = ?
                `;

                db.query(sql, [
                    profilePicture || existing.profilePicture,
                    aboutUsHeading || existing.aboutUsHeading,
                    aboutUsDescription || existing.aboutUsDescription,
                    id
                ], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const result = await updateAbout();

        if (result.affectedRows === 0) {
            return res.status(200).json({ error: 'No changes were made!', success: false });
        }

        return res.status(200).json({
            message: 'Updated successfully',
            success: true,
            data: {
                id,
                profilePicture: profilePicture || existing.profilePicture,
                aboutUsHeading: aboutUsHeading || existing.aboutUsHeading,
                aboutUsDescription: aboutUsDescription || existing.aboutUsDescription
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error', success: false });
    }
};

export const getDocAvailabilityByName = async (req, res) => {

    const { doctorName } = req.query;

    try {

        const fetchAvailability = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    SELECT DISTINCT Date 
                    FROM doctorAvailability 
                    WHERE doctorName = ?
                `;

                db.query(sql, [doctorName], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await fetchAvailability();

        return res.status(200).json({
            message: '',
            success: true,
            data: { doctorAvailability: results }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error', success: false });
    }
};

export const getDocAvailabilityTimeByDocName = async (req, res) => {

    const { doctorName } = req.query;

    try {

        if (!doctorName) {
            return res.status(400).json({ error: 'Doctor name is required!', success: false });
        }

        const getDocTimeSlots = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    SELECT DISTINCT timeSlot 
                    FROM doctorAvailability 
                    WHERE doctorName = ?
                `;

                db.query(sql, [doctorName], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await getDocTimeSlots();

        if (rows.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        return res.status(200).json({
            message: '',
            success: true,
            data: { docTimeSlot: rows }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error', success: false });
    }
};

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use another service like SendGrid, Mailgun, etc.
    auth: {
        user: "tinisthera@gmail.com",
        pass: "atubsombqjecgvjm" // Use app-specific password for Gmail
    }
});

export const addAppointment = async (req, res) => {

    const { doctorName, userName, appointmentDate, appointmentTime, appointmentType, reasonForVisit } = req.body;

    try {

        if (!doctorName || !userName || !appointmentDate || !appointmentTime || !appointmentType || !reasonForVisit) {
            return res.status(400).json({ error: 'All fields are required!', success: false });
        }

        const checkAppointment = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    SELECT * FROM appointment 
                    WHERE appointmentTime = ? AND appointmentDate = ? AND doctorName = ?
                `;

                db.query(sql, [appointmentTime, appointmentDate, doctorName], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const appResults = await checkAppointment();

        if (appResults.length > 0) {
            return res.status(400).json({ error: 'This timeslot is already booked. Please choose another!', success: false });
        }

        const insertAppointment = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    INSERT INTO appointment 
                    (doctorName, userName, appointmentDate, appointmentTime, appointmentType, status, reasonForVisit)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(sql, [doctorName, userName, appointmentDate, appointmentTime, appointmentType, "pending", reasonForVisit], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await insertAppointment();

        const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const getUserEmail = () => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT email FROM users WHERE fullName = ?`;

                db.query(sql, [userName], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        };

        const userEmailResult = await getUserEmail();

        if (userEmailResult.length === 0) {
            return res.status(400).json({ error: "User email not found", success: false });
        }

        const userEmail = userEmailResult[0].email;

        const mailOptions = {
            from: process.env.USER,
            to: userEmail,
            subject: 'Your Appointment Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #2196F3;">Appointment Confirmation</h2>
                    <p>Your appointment has been successfully booked!</p>
                    <div style="background-color: #f9f9f9; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Time:</strong> ${appointmentTime}</p>
                        <p><strong>Type:</strong> ${appointmentType}</p>
                    </div>
                    <p>Thank you for choosing our services!</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: 'Appointment booked successfully! A confirmation email has been sent.',
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server Error', success: false });
    }
};

export const getAppointmentByUser = async (req, res) => {

    const { userName } = req.query;

    try {

        if (!userName) {
            return res.status(400).json({ error: 'userName is required!', success: false });
        }

        const getAppointments = () => {
            return new Promise((resolve, reject) => {

                const sql = `SELECT * FROM appointment WHERE userName = ?`;

                db.query(sql, [userName], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await getAppointments();

        return res.status(200).json({
            message: '',
            success: true,
            data: { appointments: rows }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server Error', success: false });
    }
};

export const getDocProfilePic = async (req, res) => {

    const { doctorName } = req.query;

    try {

        if (!doctorName) {
            return res.status(400).json({ error: 'Doctor name is required!', success: false });
        }

        const getDoctor = () => {
            return new Promise((resolve, reject) => {

                const sql = `SELECT * FROM doctor WHERE doctorName = ?`;

                db.query(sql, [doctorName], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await getDoctor();

        if (rows.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        return res.status(200).json({
            message: '',
            success: true,
            data: { doctor: rows }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error', success: false });
    }
};
export const getAppointmentById = async (req, res) => {

    const { id } = req.query;

    try {

        if (!id) {
            return res.status(400).json({ error: 'ID is required!', success: false });
        }

        const getAppointment = () => {
            return new Promise((resolve, reject) => {

                const sql = `SELECT * FROM appointment WHERE id = ?`;

                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await getAppointment();

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found', success: false });
        }

        return res.status(200).json({
            message: '',
            success: true,
            data: { appointment: rows[0] }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error', success: false });
    }
};

export const updateAppointment = async (req, res) => {

    const { appointmentId } = req.params;
    const { appointmentDate, appointmentTime, appointmentType, reasonForVisit } = req.body;

    try {

        if (!appointmentId) {
            return res.status(400).json({ error: 'Appointment ID is required!', success: false });
        }

        const updateAppointmentData = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    UPDATE appointment
                    SET appointmentDate = ?, appointmentTime = ?, appointmentType = ?, reasonForVisit = ?
                    WHERE id = ?
                `;

                db.query(sql, [appointmentDate, appointmentTime, appointmentType, reasonForVisit, appointmentId], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await updateAppointmentData();

        return res.status(200).json({
            message: 'Appointment updated successfully!',
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server Error', success: false });
    }
};

export const getUserInfoByEmail = async (req, res) => {

    const { email } = req.query;

    try {

        if (!email) {
            return res.status(400).json({ error: 'Email is required!', success: false });
        }

        const getUserByEmail = () => {
            return new Promise((resolve, reject) => {

                const sql = `SELECT * FROM users WHERE email = ?`;

                db.query(sql, [email], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await getUserByEmail();

        if (rows.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        return res.status(200).json({
            message: '',
            success: true,
            data: { userEmail: rows[0] }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error', success: false });
    }
};


export const getUserInfoById = async (req, res) => {

    const { id } = req.query;

    try {

        if (!id) {
            return res.status(400).json({ error: 'ID is required!', success: false });
        }

        const getUserById = () => {
            return new Promise((resolve, reject) => {

                const sql = `SELECT * FROM users WHERE id = ?`;

                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await getUserById();

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User info not found', success: false });
        }

        return res.status(200).json({
            message: '',
            success: true,
            data: { userInfo: rows[0] }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server Error', success: false });
    }
};


export const updateUserProfile = async (req, res) => {

    const { id, fullName, email, telNo, gender, dob } = req.body;

    try {

        if (!id || !fullName || !email || !telNo || !gender || !dob) {
            return res.status(400).json({ error: 'All fields are required!', success: false });
        }

        const updateUser = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    UPDATE users
                    SET fullName = ?, email = ?, telNo = ?, gender = ?, dob = ?
                    WHERE id = ?
                `;

                db.query(sql, [fullName, email, telNo, gender, dob, id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await updateUser();

        return res.status(200).json({
            message: 'User profile updated successfully!',
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server Error', success: false });
    }
};

export const getAllAppointments = async (req, res) => {

    try {

        const getAppointments = () => {
            return new Promise((resolve, reject) => {

                const sql = `SELECT * FROM appointment`;

                db.query(sql, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await getAppointments();

        return res.status(200).json({
            message: '',
            success: true,
            data: { appointment: rows }

        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error!', success: false });
    }
};

export const getAllAllUsers = async (req, res) => {

    try {

        const getUsers = () => {
            return new Promise((resolve, reject) => {

                const sql = `SELECT * FROM users`;

                db.query(sql, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await getUsers();

        return res.status(200).json({
            message: '',
            success: true,
            data: { users: rows }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error!', success: false });
    }
};
export const updateUserAppointment = async (req, res) => {

    const {
        id,
        Status,
        doctorName,
        appointmentDate,
        appointmentTime,
        appointmentType,
        fullName,
        email
    } = req.body;

    try {

        if (!id || !Status) {
            return res.status(400).json({ error: 'ID and status are required!', success: false });
        }

        const getAppointment = () => {
            return new Promise((resolve, reject) => {

                const sql = `SELECT * FROM appointment WHERE id = ?`;

                db.query(sql, [id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await getAppointment();

        if (results.length === 0) {
            return res.status(200).json({ error: 'No information found!', success: false });
        }

        const appoint = results[0];

        const updateStatus = () => {
            return new Promise((resolve, reject) => {

                const sql = `UPDATE appointment SET Status = ? WHERE id = ?`;

                db.query(sql, [Status || appoint.Status, id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await updateStatus();

        const formattedDates = new Date(appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const getUserEmail = () => {
            return new Promise((resolve, reject) => {

                const sql = `SELECT email FROM users WHERE fullName = ?`;

                db.query(sql, [fullName], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const userEmailRows = await getUserEmail();

        if (userEmailRows.length === 0) {
            return res.status(200).json({ error: 'No user email found!', success: false });
        }

        const userEm = userEmailRows[0];

        let userMailOptions, adminMailOptions;

        if (Status === 'Approved') {
            userMailOptions = {
                from: process.env.USER,
                to: userEm.email,
                subject: 'Appointment Approved',
                html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f8fb; padding: 20px;">
        
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background-color: skyblue; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">👁️ Appointment Status Update</h2>
            </div>

            <!-- Body -->
            <div style="padding: 20px; color: #333;">
                
                <p>Hello <strong>${fullName}</strong>,</p>

                <p>Your appointment has been <strong style="color: green;">APPROVED</strong>.</p>

                <hr/>

                <h3 style="color: skyblue;">📋 Appointment Details</h3>

                <p><strong>👨‍⚕️ Doctor:</strong> ${doctorName}</p>
                <p><strong>📅 Date:</strong> ${formattedDates}</p>
                <p><strong>⏰ Time:</strong> ${appointmentTime}</p>
                <p><strong>📌 Type:</strong> ${appointmentType}</p>
                <p><strong>📧 Email:</strong> ${userEm.email}</p>
                <p><strong>📊 Status:</strong> ${Status}</p>

                <hr/>

                <p style="color: #555;">Thank you for choosing our service.</p>

            </div>

            <!-- Footer -->
            <div style="background: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #777;">
                © 2026 Your Medical System
            </div>

        </div>
    </div>
    `
            };

            adminMailOptions = {
                from: process.env.USER,
                to: email,
                subject: 'Appointment Approved',
                html: `<p>Appointment approved for ${userEm.email}</p>`
            };
        }

        if (Status === 'Rejected') {
            userMailOptions = {
                from: process.env.USER,
                to: userEm.email,
                subject: 'Appointment Rejected',
                html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f8fb; padding: 20px;">
        
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            
            <div style="background-color: skyblue; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">👁️ Appointment Status Update</h2>
            </div>

            <div style="padding: 20px; color: #333;">
                
                <p>Hello <strong>${fullName}</strong>,</p>

                <p>Your appointment has been <strong style="color: red;">REJECTED</strong>.</p>

                <hr/>

                <h3 style="color: skyblue;">📋 Appointment Details</h3>

                <p><strong>👨‍⚕️ Doctor:</strong> ${doctorName}</p>
                <p><strong>📅 Date:</strong> ${formattedDates}</p>
                <p><strong>⏰ Time:</strong> ${appointmentTime}</p>
                <p><strong>📌 Type:</strong> ${appointmentType}</p>
                <p><strong>📧 Email:</strong> ${userEm.email}</p>
                <p><strong>📊 Status:</strong> ${Status}</p>

                <hr/>

                <p style="color: #555;">Please contact support for more information.</p>

            </div>

            <div style="background: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #777;">
                © 2026 Your Medical System
            </div>

        </div>
    </div>
    `
            };

            adminMailOptions = {
                from: process.env.USER,
                to: email,
                subject: 'Appointment Rejected',
                html: `<p>Appointment rejected for ${userEm.email}</p>`
            };
        }

        if (Status === 'Approved' || Status === 'Rejected') {
            try {
                await transporter.sendMail(userMailOptions);
                await transporter.sendMail(adminMailOptions);
            } catch (error) {
                console.error("Email sending failed:", error);
            }
        }

        return res.status(200).json({
            message: 'Appointment status updated successfully!',
            success: true,
            data: {
                id: id,
                Status: Status || appoint.Status
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong!', success: false });
    }
};

// do this one till the end
export const searchDoc = async (req, res) => {

    const search = req.query.search || "";

    try {

        const searchDoctor = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM doctor WHERE doctorName LIKE ?";

                db.query(sql, [`%${search}%`], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await searchDoctor();

        if (rows.length === 0) {
            return res.status(404).json({ message: "No doctors found", success: false });
        }

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ error: "Server error", success: false });
    }
};

export const searchAppointment = async (req, res) => {

    const search = req.query.search || "";

    try {

        const searchAppointments = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM appointment WHERE userName LIKE ?";

                db.query(sql, [`%${search}%`], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await searchAppointments();

        if (rows.length === 0) {
            return res.status(404).json({ message: "No users found!", success: false });
        }

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ error: "Server error", success: false });
    }
};


export const verifyEmail = async (req, res) => {

    const { email } = req.body;

    try {

        if (!email) {
            return res.status(200).json({ error: 'Email is required!', success: false });
        }

        const otpGen = genOTP.generate(6, {
            digits: true,
            upperCase: false,
            lowerCase: false,
            specialChars: false
        });

        const hashedOtp = await hashOtp(otpGen);

        const checkEmail = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM users WHERE email = ?";

                db.query(sql, [email], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const rows = await checkEmail();

        if (rows.length === 0) {
            return res.status(200).json({ error: 'Email address not registered!', success: false });
        }

        const user_email = rows[0];

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: 'OTP Verification',
            html: `<p>Your OTP is: <b>${otpGen}</b></p>`
        });

        const insertOtp = () => {
            return new Promise((resolve, reject) => {

                const sql = "INSERT INTO otp (otp, userEmail) VALUES (?, ?)";

                db.query(sql, [hashedOtp, email], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await insertOtp();

        return res.status(200).json({
            message: 'OTP sent!',
            success: true,
            data: { user_email }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error!', success: false });
    }
};


export const verifyOtp = async (req, res) => {

    const { otp, email } = req.body;

    try {

        if (!otp || otp.length !== 6) {
            return res.status(200).json({ error: 'OTP must be 6 digits!', success: false });
        }

        const getOtp = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM otp WHERE userEmail = ?";

                db.query(sql, [email], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const otpResults = await getOtp();

        if (otpResults.length === 0) {
            return res.status(200).json({ error: 'Email not found!', success: false });
        }

        const otp_ = otpResults[0];

        const isMatch = await compareOtp(otp, otp_.otp);

        if (!isMatch) {
            return res.status(200).json({ error: 'OTP Do Not Match!', success: false });
        }

        const updateUser = () => {
            return new Promise((resolve, reject) => {

                const sql = "UPDATE users SET isVerified = ? WHERE email = ?";

                db.query(sql, [1, email], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await updateUser();

        const deleteOtp = () => {
            return new Promise((resolve, reject) => {

                const sql = "DELETE FROM otp WHERE otp = ?";

                db.query(sql, [otp_.otp], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await deleteOtp();

        return res.status(200).json({
            message: 'OTP Verified!',
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error!', success: false });
    }
};


export const change_password = async (req, res) => {

    const { password, confirmPassword, email } = req.body;

    try {

        if (!password || password.length < 6 ||
            !confirmPassword || confirmPassword.length < 6) {

            return res.status(200).json({
                error: 'Passwords must be at least 6 characters long!',
                success: false
            });
        }

        const getUser = () => {
            return new Promise((resolve, reject) => {

                const sql = "SELECT * FROM users WHERE email = ?";

                db.query(sql, [email], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        const results = await getUser();

        if (results.length === 0) {
            return res.status(200).json({ error: 'User not found!', success: false });
        }

        const user = results[0];

        if (!user.isVerified) {
            return res.status(200).json({
                error: 'Please verify your OTP first!',
                success: false
            });
        }

        if (password !== confirmPassword) {
            return res.status(200).json({
                error: 'Passwords Do Not Match!',
                success: false
            });
        }

        const hashPass = await hashPassword(password);
        const hashConfirmPass = await hasConfrimPassword(confirmPassword);

        const updatePassword = () => {
            return new Promise((resolve, reject) => {

                const sql = `
                    UPDATE users 
                    SET password = ?, confirmPassword = ? 
                    WHERE email = ?
                `;

                db.query(sql, [hashPass, hashConfirmPass, email], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });

            });
        };

        await updatePassword();

        return res.status(200).json({
            message: 'Password changed successfully!',
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error!', success: false });
    }
};

