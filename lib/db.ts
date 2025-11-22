import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Create pool without database first (for creating database if needed)
function createPool(includeDatabase: boolean = true): mysql.Pool {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: includeDatabase ? process.env.DB_NAME : undefined,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true,
  });
}

// Initialize pool with database
const pool = createPool(true);

export default pool;

// Initialize database tables
export async function initDatabase() {
  let tempPool: mysql.Pool | null = null;
  
  try {
    // Try to create database if it doesn't exist
    try {
      tempPool = createPool(false);
      const dbName = process.env.DB_NAME;
      if (dbName) {
        await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await tempPool.end();
        tempPool = null;
      }
    } catch (createDbError: any) {
      // If we can't create database, continue - it might already exist
      console.warn('Could not create database (it might already exist):', createDbError.message);
      if (tempPool) {
        await tempPool.end();
        tempPool = null;
      }
    }

    // Re-initialize pool with database after creating it (if needed)
    // If database was just created, we need to reconnect
    const dbPool = pool;

    // Create users table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'user',
        googleId VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin user if it doesn't exist
    const [existingAdmin] = await dbPool.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@admin.com']
    ) as any[];

    let adminCreated = false;
    if (Array.isArray(existingAdmin) && existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await dbPool.query(
        'INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)',
        ['admin@admin.com', 'Admin', hashedPassword, 'admin']
      );
      adminCreated = true;
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Create maintenance_logs table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        carMake VARCHAR(255) NOT NULL,
        carModel VARCHAR(255) NOT NULL,
        serviceType VARCHAR(255) NOT NULL,
        serviceDate DATE NOT NULL,
        mileage INT,
        cost DECIMAL(10, 2),
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    return {
      adminCreated,
      adminEmail: 'admin@admin.com',
      adminPassword: 'admin',
    };
  } catch (error: any) {
    console.error('Database initialization error:', error);
    if (tempPool) {
      try {
        await tempPool.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    throw error;
  }
}

