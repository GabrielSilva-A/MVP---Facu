require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// CORS: permitir peticiones desde el cliente (ajusta en producción)
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta src
app.use(express.static(path.join(__dirname, '../src')));

// Configurar pool de PostgreSQL usando DATABASE_URL o variables individuales
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
});

async function ensureTable() {
    const client = await pool.connect();
    try {
        // Crear tabla de usuarios con rol
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
    } finally {
        client.release();
    }
}

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const client = await pool.connect();
        try {
            // Comprobar si usuario o email ya existen
            const existing = await client.query('SELECT id FROM users WHERE username=$1 OR email=$2', [username, email]);
            if (existing.rows.length > 0) return res.status(409).json({ error: 'Username or email already in use' });

            const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
            const hash = await bcrypt.hash(password, saltRounds);

            const insert = await client.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
                [username, email, hash]
            );

            const user = insert.rows[0];
            return res.status(201).json({ id: user.id, username: user.username, email: user.email });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const client = await pool.connect();
        try {
            // Buscar usuario por nombre de usuario
            const result = await client.query('SELECT id, username, email, password_hash, role FROM users WHERE username=$1', [username]);
            if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

            const user = result.rows[0];
            // Comparar contraseñas
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

            // Login exitoso - devolver rol del usuario
            return res.status(200).json({ 
                id: user.id, 
                username: user.username, 
                email: user.email,
                role: user.role
            });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Crear curso (solo admin)
app.post('/api/courses', async (req, res) => {
    const { title, description, price, user_id, role } = req.body || {};
    
    if (role !== 'admin') return res.status(403).json({ error: 'Only admins can create courses' });
    if (!title || !price || !user_id) return res.status(400).json({ error: 'Missing fields' });

    try {
        const client = await pool.connect();
        try {
            const insert = await client.query(
                'INSERT INTO courses (title, description, price, instructor_id) VALUES ($1, $2, $3, $4) RETURNING *',
                [title, description || null, price, user_id]
            );
            return res.status(201).json(insert.rows[0]);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Course creation error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Obtener todos los cursos
app.get('/api/courses', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM courses ORDER BY created_at DESC');
            return res.status(200).json(result.rows);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Fetch courses error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Obtener todos los usuarios (solo admin puede acceder)
app.get('/api/users', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
            return res.status(200).json(result.rows);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Fetch users error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Obtener todas las compras con información del usuario y curso
app.get('/api/all-purchases', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT p.id, p.purchased_at, u.username, c.title as course_title, c.price
                FROM purchases p
                INNER JOIN users u ON p.user_id = u.id
                INNER JOIN courses c ON p.course_id = c.id
                ORDER BY p.purchased_at DESC
            `);
            return res.status(200).json(result.rows);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Fetch purchases error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Obtener cursos comprados por un usuario
app.get('/api/user-courses/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT c.* FROM courses c
                INNER JOIN purchases p ON c.id = p.course_id
                WHERE p.user_id = $1
                ORDER BY p.purchased_at DESC
            `, [user_id]);
            return res.status(200).json(result.rows);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Fetch user courses error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Comprar curso
app.post('/api/purchase', async (req, res) => {
    const { user_id, course_id } = req.body || {};
    
    if (!user_id || !course_id) return res.status(400).json({ error: 'Missing fields' });

    try {
        const client = await pool.connect();
        try {
            const insert = await client.query(
                'INSERT INTO purchases (user_id, course_id) VALUES ($1, $2) RETURNING *',
                [user_id, course_id]
            );
            return res.status(201).json({ message: 'Course purchased successfully', purchase: insert.rows[0] });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Purchase error:', err);
        return res.status(500).json({ error: 'Server error or course already purchased' });
    }
});

// Editar curso (solo admin)
app.put('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, price, user_id, role } = req.body || {};
    if (role !== 'admin') return res.status(403).json({ error: 'Only admins can edit courses' });
    if (!title || !price) return res.status(400).json({ error: 'Missing fields' });

    try {
        const client = await pool.connect();
        try {
            const update = await client.query(
                'UPDATE courses SET title=$1, description=$2, price=$3 WHERE id=$4 AND instructor_id=$5 RETURNING *',
                [title, description || null, price, id, user_id]
            );
            if (update.rows.length === 0) return res.status(404).json({ error: 'Course not found or not owned by this instructor' });
            return res.status(200).json(update.rows[0]);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Update course error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Eliminar curso (solo admin)
app.delete('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, role } = req.body || {};
    if (role !== 'admin') return res.status(403).json({ error: 'Only admins can delete courses' });

    try {
        const client = await pool.connect();
        try {
            // Primero eliminar compras relacionadas
            await client.query('DELETE FROM purchases WHERE course_id=$1', [id]);
            const del = await client.query('DELETE FROM courses WHERE id=$1 AND instructor_id=$2 RETURNING *', [id, user_id]);
            if (del.rows.length === 0) return res.status(404).json({ error: 'Course not found or not owned by this instructor' });
            return res.status(200).json({ message: 'Course deleted' });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Delete course error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Actualizar rol de usuario (promover/demover) - solo admin
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { role, actor_role } = req.body || {};
    if (actor_role !== 'admin') return res.status(403).json({ error: 'Only admins can change roles' });
    if (!role || !['admin', 'client'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    try {
        const client = await pool.connect();
        try {
            const update = await client.query('UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, email, role, created_at', [role, id]);
            if (update.rows.length === 0) return res.status(404).json({ error: 'User not found' });
            return res.status(200).json(update.rows[0]);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Update user role error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Eliminar usuario (solo admin)
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { actor_role } = req.body || {};
    if (actor_role !== 'admin') return res.status(403).json({ error: 'Only admins can delete users' });

    try {
        const client = await pool.connect();
        try {
            // Eliminar compras del usuario
            await client.query('DELETE FROM purchases WHERE user_id=$1', [id]);
            const del = await client.query('DELETE FROM users WHERE id=$1 RETURNING id, username, email', [id]);
            if (del.rows.length === 0) return res.status(404).json({ error: 'User not found' });
            return res.status(200).json({ message: 'User deleted' });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Delete user error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Inicializar tabla y levantar servidor
ensureTable().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to prepare database:', err);
    process.exit(1);
});
