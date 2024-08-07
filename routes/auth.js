const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const router = express.Router();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function checkConnection() {
    try {
        const connection = await db.getConnection();
        console.log('Connected to the database!');
        connection.release(); // Lepaskan koneksi kembali ke pool
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
    }
}

checkConnection();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory to save files
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        cb(null, filename); // Specify the filename to save
    },
});

const upload = multer({ storage });

router.post('/upload', upload.single('foto'), (req, res) => {
    try {
        const { id_user } = req.body;
        const fotoUrl = req.file ? req.file.filename : null;

        const query = 'INSERT INTO data (id_user,foto) VALUES (?,?)'
        if (!fotoUrl) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.status(201).json({ fotoUrl });
        db.query(query, [id_user, fotoUrl]);
    } catch (error) {
        console.error('Error during file upload:', error.message);
        res.status(500).json({ error: 'An error occurred during file upload' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(201).json(user);
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { nama_member, no_ktp, ttl, jenis_kelamin, alamat, rt, rw, desa, kecamatan, kabupaten, provinsi, agama, status_perkawinan, pekerjaan, nohp, email, password
        } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await db.query('INSERT INTO users (nama_member, no_ktp, ttl, jenis_kelamin, alamat, rt, rw, desa, kecamatan, kabupaten, provinsi, agama, status_perkawinan, pekerjaan, nohp, email, password) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [nama_member, no_ktp, ttl, jenis_kelamin, alamat, rt, rw, desa, kecamatan, kabupaten, provinsi, agama, status_perkawinan, pekerjaan, nohp, email, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during registration' });
    }
});

module.exports = router;