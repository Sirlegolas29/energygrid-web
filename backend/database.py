import sqlite3
import os
import bcrypt

DB_PATH = "energygrid.db"

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            full_name TEXT,
            email TEXT,
            hashed_password TEXT NOT NULL,
            role TEXT DEFAULT 'Ingeniero',
            created_at TEXT
        )
    ''')
    
    # Migraciones suaves para bases de datos existentes
    existing_cols = [row[1] for row in c.execute("PRAGMA table_info(users)").fetchall()]
    if "full_name" not in existing_cols:
        c.execute("ALTER TABLE users ADD COLUMN full_name TEXT")
    if "email" not in existing_cols:
        c.execute("ALTER TABLE users ADD COLUMN email TEXT")
    if "role" not in existing_cols:
        c.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'Ingeniero'")
    if "created_at" not in existing_cols:
        c.execute("ALTER TABLE users ADD COLUMN created_at TEXT")

    c.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    
    # Crear o actualizar usuario admin por defecto (pass: admin)
    admin_row = c.execute("SELECT id FROM users WHERE username = 'admin'").fetchone()
    admin_hash = bcrypt.hashpw(b"admin", bcrypt.gensalt()).decode("utf-8")
    
    if not admin_row:
        c.execute(
            "INSERT INTO users (username, full_name, email, hashed_password, role, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
            ("admin", "Administrador EnergyGrid", "admin@energygrid.com", admin_hash, "Administrador")
        )
    else:
        c.execute(
            "UPDATE users SET hashed_password = ?, role = 'Administrador', full_name = COALESCE(full_name, 'Administrador EnergyGrid') WHERE username = 'admin'",
            (admin_hash,)
        )
        
    conn.commit()
    conn.close()

init_db()