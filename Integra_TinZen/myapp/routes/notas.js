const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'integratz' // Nome do seu banco de dados
};

// Configuração da conexão com o banco de dados
const pool = mysql.createPool(dbConfig);

// Função para recuperar os dados do banco de dados
async function getNotasFiscais() {
    try {
        const [rows] = await pool.query('SELECT * FROM notas_fiscais');
        return rows;
    } catch (error) {
        console.error('Erro ao recuperar as notas fiscais do banco de dados:', error);
        throw error;
    }
}

/* GET notas listing. */
router.get('/', async function (req, res, next) {
    const page = parseInt(req.query.page) || 1; 
    const pageSize = 10; 
    const offset = (page - 1) * pageSize; 

    try {
        const [rows] = await pool.query(`
            SELECT nf.numero, nf.chave_acesso, i.codigo 
            FROM notas_fiscais nf 
            LEFT JOIN itens i ON nf.id = i.nota_fiscal_id 
            LIMIT ? OFFSET ?`, [pageSize, offset]);

        const [[{ total }]] = await pool.query(`
            SELECT COUNT(*) as total 
            FROM notas_fiscais nf 
            LEFT JOIN itens i ON nf.id = i.nota_fiscal_id`);

        const totalPages = Math.ceil(total / pageSize);

        res.render('notas', { 
            title: 'Integra TinZen - Notas Fiscais', 
            notasFiscais: rows,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.error('Erro ao recuperar as notas fiscais do banco de dados:', error);
        res.status(500).send('Erro ao recuperar as notas fiscais do banco de dados');
    }
});

/* DELETE notas fiscais */
router.delete("/", async (req, res) => {
    const { notasNumeros } = req.body;

    if (!notasNumeros || notasNumeros.length === 0) {
        return res.status(400).json({ error: "Nenhuma nota fiscal selecionada para remoção" });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.query(
            'SELECT id, integracao FROM notas_fiscais WHERE numero IN (?)',
            [notasNumeros]
        );

        const notasNaoDeletadas = rows.filter(row => row.integracao === 1);

        if (notasNaoDeletadas.length > 0) {
            return res.status(400).json({
                error: `As notas fiscais com os números ${notasNaoDeletadas.map(nota => nota.numero).join(', ')} não podem ser removidas, pois já foram integradas.`
            });
        }

        const ids = rows.map(row => row.id);

        if (ids.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Nenhuma nota fiscal encontrada para remoção" });
        }

        await connection.query('DELETE FROM itens WHERE nota_fiscal_id IN (?)', [ids]);
        await connection.query('DELETE FROM notas_fiscais WHERE id IN (?)', [ids]);

        await connection.commit();

        res.status(200).json({ message: "Notas fiscais e itens removidos com sucesso!" });
    } catch (error) {
        console.error("Erro ao remover notas fiscais e itens:", error.message);
        if (connection) await connection.rollback();
        res.status(500).json({ error: "Erro ao remover notas fiscais e itens" });
    } finally {
        if (connection) connection.release();
    }
});
    
module.exports = router;
