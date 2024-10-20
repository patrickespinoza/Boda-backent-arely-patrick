const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/confirmar-asistencia", (req, res) => {
  const { name, numPeople } = req.body;

  // Ruta del archivo Excel
  const filePath = path.join(__dirname, "Asistencia.xlsx");

  // Leer el archivo existente o crear uno nuevo
  let workbook;
  let worksheet;

  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);

    // Verifica si la hoja "Asistencia" existe
    if (workbook.SheetNames.includes("Asistencia")) {
      worksheet = workbook.Sheets["Asistencia"];
    } else {
      // Si no existe, crea una hoja con los encabezados
      worksheet = XLSX.utils.aoa_to_sheet([["Nombre", "Número de Personas"]]); // Cabecera
      XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");
    }
  } else {
    workbook = XLSX.utils.book_new(); // Crea un nuevo libro si no existe
    worksheet = XLSX.utils.aoa_to_sheet([["Nombre", "Número de Personas"]]); // Cabecera
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");
  }

  // Leer los datos existentes en la hoja
  const data = XLSX.utils.sheet_to_json(worksheet);

  // Agregar la nueva entrada
  data.push({ Nombre: name, "Número de Personas": numPeople });

  // Convertir el arreglo de nuevo a una hoja
  const newWorksheet = XLSX.utils.json_to_sheet(data);

  // Reemplazar la hoja existente "Asistencia" con la nueva hoja
  workbook.Sheets["Asistencia"] = newWorksheet;

  // Escribir el archivo
  XLSX.writeFile(workbook, filePath);

  res.send("Confirmación guardada");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
