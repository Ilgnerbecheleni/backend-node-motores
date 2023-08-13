const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importe a biblioteca CORS
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3333;

// Configuração da conexão com o banco de dados PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'motores',
  password: 'admin',
  port: 5432,
});


// (async () => {
//     const client = await pool.connect();
//     try {
//       const query = `
//         CREATE TABLE IF NOT EXISTS motors (
//           id SERIAL PRIMARY KEY,
//           marca TEXT NOT NULL,
//           potencia TEXT NOT NULL,
//           polos TEXT NOT NULL,
//           carcaca TEXT NOT NULL,
//           tensao TEXT NOT NULL,
//           corrente TEXT NOT NULL,
//           flange TEXT NOT NULL,
//           modeloFlange TEXT NOT NULL,
//           rolamentoD TEXT NOT NULL,
//           rolamentoT TEXT NOT NULL,
//           codigoSistema TEXT NOT NULL,
//           created_at TIMESTAMP DEFAULT NOW(),
//           updated_at TIMESTAMP
//         )
//       `;
//       await client.query(query);
//       console.log('Table "motors" created successfully.');
//     } catch (error) {
//       console.error('Error creating table:', error);
//     } finally {
//       client.release();
//       pool.end();
//     }
//   })();


app.use(cors()); // Use o CORS antes das rotas
app.use(bodyParser.json());

// Rota para cadastrar um novo motor
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

// Rota para buscar todos os motores cadastrados
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
