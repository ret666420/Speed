import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión a Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Registro
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const existe = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await pool.query(
      'INSERT INTO "User" (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id',
      [username, email, hashedPassword]
    );

    const userId = nuevoUsuario.rows[0].user_id;

    await pool.query(
      'INSERT INTO "Profile" (user_id, display_name, monedas) VALUES ($1, $2, $3)',
      [userId, username, 0]
    );

    res.json({ message: "Usuario registrado correctamente", user_id: userId });
  } catch (err) {
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const perfil = await pool.query(
      'SELECT display_name, monedas FROM "Profile" WHERE user_id = $1',
      [user.user_id]
    );

    res.json({
      message: "Login exitoso",
      user_id: user.user_id,
      username: user.username,
      profile: perfil.rows[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo  ${PORT}`));
