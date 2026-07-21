import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

export async function getDatabaseConnection() {
    const db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    // Tabela de Máquinas
    await db.exec(`
        CREATE TABLE IF NOT EXISTS machines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            temp REAL NOT NULL,
            target REAL NOT NULL,
            status TEXT NOT NULL,
            history TEXT NOT NULL
        )
    `);

    // NOVA: Tabela de Usuários
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `);

    // Criar usuário padrão se a tabela estiver vazia
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10); // Criptografa a senha admin123
        await db.run(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            ['Administrador', 'admin@coldmonitor.com', hashedPassword]
        );
    }

    // Alimenta as máquinas se estiver vazio
    const machineCount = await db.get('SELECT COUNT(*) as count FROM machines');
    if (machineCount.count === 0) {
        await db.run(
            `INSERT INTO machines (name, location, temp, target, status, history) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            ['Câmara Fria 01 (BD)', 'Galpão Principal', -18.5, -18.0, 'ok', JSON.stringify([-17.8, -18.0, -18.2, -18.4, -18.5, -18.5])]
        );
    }

    return db;
}