import pkg from "pg"; //para conectar a neon, dentro vienen varias pero me importa solo la de pool que es para usar un grupo de conexiones
import dotenv from "dotenv";//este sirve para leer los archivos de configuracion en el .env

dotenv.config();

const { Pool } = pkg;
console.log("CADENA RECIBIDA:", process.env.DATABASE_URL);
//creo el pool de conexiones que voy a usar en el server.js, y se refiere a un grupo de conexiones a la base de datos para que no se abra y 
// cierre una conexion cada vez que se hace una consulta
export const pool = new Pool({
  
    connectionString: process.env.DATABASE_URL, //la cadena de conexion que esta en el .env
  
  ssl: { rejectUnauthorized: false }//permite conexiones seguras y ademas neon requiere esto de afuerza
  
});
