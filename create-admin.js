// Script para crear un usuario admin inicial
// Ejecutar con: node create-admin.js

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
});

async function createAdmin() {
    const client = await pool.connect();
    try {
        // Primero, crear la tabla si no existe
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // Agregar columna 'role' si no existe
        try {
            await client.query(`
                ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client'));
            `);
            console.log('✓ Columna "role" agregada a tabla users');
        } catch (err) {
            if (err.code === '42701') {
                // Columna ya existe
                console.log('✓ La columna "role" ya existe');
            } else {
                throw err;
            }
        }

        // Crear tabla de cursos
        await client.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                instructor_id INTEGER NOT NULL REFERENCES users(id),
                created_at TIMESTAMP DEFAULT now()
            );
        `);
        console.log('✓ Tabla "courses" lista');

        // Crear tabla de compras
        await client.query(`
            CREATE TABLE IF NOT EXISTS purchases (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                course_id INTEGER NOT NULL REFERENCES courses(id),
                purchased_at TIMESTAMP DEFAULT now(),
                UNIQUE(user_id, course_id)
            );
        `);
        console.log('✓ Tabla "purchases" lista');

        const username = 'admin';
        const email = 'admin@example.com';
        const password = 'admin123'; // Cambiar en producción
        const role = 'admin';

        const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
        const hash = await bcrypt.hash(password, saltRounds);

        try {
            const result = await client.query(
                'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
                [username, email, hash, role]
            );

            console.log('✓ Admin creado exitosamente:');
            console.log('  Username:', username);
            console.log('  Email:', email);
            console.log('  Password:', password);
            console.log('\n⚠️  IMPORTANTE: Cambia la contraseña en producción');
        } catch (err) {
            if (err.code === '23505') {
                console.log('✓ El usuario admin ya existe');
            } else {
                throw err;
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        client.release();
    }
}

createAdmin();
