const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 3333;

const pool = new Pool({
  user: 'ilgner',
  host: 'localhost',
  database: 'motores',
  password: '123456',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// Função para criar um arquivo Excel com os dados
async function createExcelFile(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Dados');

  // Adicionar cabeçalho
  const headerRow = worksheet.addRow(Object.keys(data[0]));
  headerRow.font = { bold: true };

  // Adicionar os dados
  data.forEach(record => {
    worksheet.addRow(Object.values(record));
  });

  // Salvar o arquivo Excel em memória
  return await workbook.xlsx.writeBuffer();
}

app.post('/api/motors', async (req, res) => {
  const motorData = req.body;
  try {
    await pool.query(
      'INSERT INTO motors(marca, potencia, polos, carcaca, tensao, corrente, flange, modeloFlange, rolamentoD, rolamentoT, codigoSistema) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [
        motorData.marca,
        motorData.potencia,
        motorData.polos,
        motorData.carcaca,
        motorData.tensao,
        motorData.corrente,
        motorData.flange,
        motorData.modeloFlange,
        motorData.rolamentoD,
        motorData.rolamentoT,
        motorData.codigoSistema,
      ]
    );

    res.status(201).json({ message: 'Motor cadastrado com sucesso.' });
  } catch (error) {
    console.error('Error creating motor:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao cadastrar o motor.' });
  }
});

app.get('/api/motors', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM motors');
    client.release();
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching motors:', error);
    res.status(500).json({ error: 'An error occurred while fetching motors.' });
  }
});

// Rota para fazer o download do arquivo Excel com os dados dos motores
app.get('/api/download', async (req, res) => {
  try {
    const motors = await pool.query('SELECT * FROM motors');
    const excelBuffer = await createExcelFile(motors.rows);

    res.setHeader('Content-Disposition', 'attachment; filename=motores.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error creating Excel:', error);
    res.status(500).json({ error: 'An error occurred while creating Excel.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
