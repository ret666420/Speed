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

// Conexión a Neon
const connectionString = process.env.DATABASE_URL;
console.log("CADENA RECIBIDA:", connectionString);

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Verificamos la conexión
pool
  .connect()
  .then(() => console.log(" Conectado a Neon"))
  .catch((err) => console.error("Error al conectar a Neon:", err));

   // esta es la ruta de registro de usuarios
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validamis campos
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // Verificar si ya existe el usuario
    const existe = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Encriptamos contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en User
    const nuevoUsuario = await pool.query(
      'INSERT INTO "User" (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id',
      [username, email, hashedPassword]
    );

    const userId = nuevoUsuario.rows[0].user_id;

    // Crear su perfil inicial
    await pool.query(
      'INSERT INTO "Profile" (user_id, display_name, monedas) VALUES ($1, $2, $3)',
      [userId, username, 0]
    );

    res.json({ message: "Usuario registrado correctamente", user_id: userId });
  } catch (err) {
    console.error("Error al registrar:", err);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// esta es la ruta de login de usuarios  
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
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    res.json({
      message: "Login exitoso",
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error en el login:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});
//iniciamos el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
