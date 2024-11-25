const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Client } = require("pg");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos
const client = new Client({
  connectionString: process.env.DATABASE_URL, // Render te da esta URL
  ssl: { rejectUnauthorized: false }, // Requiere SSL para conexiones remotas en Render
});

client
  .connect()
  .then(() => console.log("Conexión a la base de datos exitosa"))
  .catch((err) => console.error("Error al conectar a la base de datos", err));

app.post("/confirmar-asistencia", async (req, res) => {
  const { name, numPeople } = req.body;

  try {
    // Crear la tabla si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS asistencia (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255),
        num_personas INT
      );
    `);

    // Insertar los datos en la tabla
    await client.query(
      "INSERT INTO asistencia (nombre, num_personas) VALUES ($1, $2)",
      [name, numPeople]
    );

    res.send("Confirmación guardada");
  } catch (error) {
    console.error("Error al guardar la confirmación:", error);
    res.status(500).send("Error al guardar la confirmación");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/asistencia", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM asistencia");
    res.json(result.rows); // Devuelve los datos como JSON
  } catch (error) {
    console.error("Error al obtener asistencia:", error);
    res.status(500).send("Error al obtener los datos de asistencia");
  }
});
