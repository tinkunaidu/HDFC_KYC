#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'kyc.db');

// Initialize database
async function initDB() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  
  // Read and execute schema
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  await db.exec(schema);
  
  return db;
}

// CLI Commands
const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  const db = await initDB();
  
  try {
    switch (command) {
      case 'list':
      case 'ls':
        await listApplications(db);
        break;
      
      case 'get':
        if (!args[0]) {
          console.error('Usage: node db.js get <id|mobile|document_number>');
          process.exit(1);
        }
        await getApplication(db, args[0]);
        break;
      
      case 'add':
        await addApplication(db, args);
        break;
      
      case 'update':
        if (!args[0] || !args[1]) {
          console.error('Usage: node db.js update <id> <field> <value>');
          process.exit(1);
        }
        await updateApplication(db, args[0], args[1], args[2]);
        break;
      
      case 'delete':
      case 'remove':
        if (!args[0]) {
          console.error('Usage: node db.js delete <id>');
          process.exit(1);
        }
        await deleteApplication(db, args[0]);
        break;
      
      case 'stats':
        await showStats(db);
        break;
      
      case 'search':
        if (!args[0]) {
          console.error('Usage: node db.js search <query>');
          process.exit(1);
        }
        await searchApplications(db, args[0]);
        break;
      
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
      
      default:
        console.error('Unknown command. Use "node db.js help" for usage.');
        process.exit(1);
    }
  } finally {
    await db.close();
  }
}

async function listApplications(db) {
  const limit = args[0] ? parseInt(args[0]) : 50;
  const applications = await db.all(`
    SELECT 
      id,
      name,
      mobile,
      email,
      document_type,
      document_number,
      status,
      attempts_count,
      created_at,
      updated_at
    FROM kyc_applications
    ORDER BY created_at DESC
    LIMIT ?
  `, [limit]);
  
  if (applications.length === 0) {
    console.log('No applications found.');
    return;
  }
  
  console.log(`\nFound ${applications.length} application(s):\n`);
  console.table(applications);
}

async function getApplication(db, identifier) {
  const app = await db.get(`
    SELECT * FROM kyc_applications
    WHERE id = ? OR mobile = ? OR document_number = ?
  `, [identifier, identifier, identifier]);
  
  if (!app) {
    console.log(`No application found with ID/mobile/document: ${identifier}`);
    return;
  }
  
  console.log('\nApplication Details:');
  console.log('==================');
  console.log(JSON.stringify(app, null, 2));
}

async function addApplication(db, args) {
  // Parse arguments: name mobile email document_type document_number status
  if (args.length < 5) {
    console.error('Usage: node db.js add <name> <mobile> <email> <document_type> <document_number> [status]');
    process.exit(1);
  }
  
  const [name, mobile, email, docType, docNumber, status = 'pending'] = args;
  const id = `KYC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    await db.run(`
      INSERT INTO kyc_applications 
      (id, name, mobile, email, document_type, document_number, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [id, name, mobile, email, docType, docNumber, status]);
    
    console.log(`✓ Application added with ID: ${id}`);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      console.error('✗ Error: Mobile or Document Number already exists');
    } else {
      console.error('✗ Error:', error.message);
    }
    process.exit(1);
  }
}

async function updateApplication(db, id, field, value) {
  const allowedFields = ['name', 'mobile', 'email', 'document_type', 'document_number', 'status', 'attempts_count'];
  
  if (!allowedFields.includes(field)) {
    console.error(`✗ Invalid field. Allowed fields: ${allowedFields.join(', ')}`);
    process.exit(1);
  }
  
  try {
    const result = await db.run(`
      UPDATE kyc_applications
      SET ${field} = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [value, id]);
    
    if (result.changes === 0) {
      console.log(`✗ No application found with ID: ${id}`);
    } else {
      console.log(`✓ Application ${id} updated successfully`);
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

async function deleteApplication(db, id) {
  const result = await db.run('DELETE FROM kyc_applications WHERE id = ?', [id]);
  
  if (result.changes === 0) {
    console.log(`✗ No application found with ID: ${id}`);
  } else {
    console.log(`✓ Application ${id} deleted successfully`);
  }
}

async function showStats(db) {
  const stats = await db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'locked' THEN 1 ELSE 0 END) as locked
    FROM kyc_applications
  `);
  
  console.log('\nKYC Database Statistics:');
  console.log('======================');
  console.log(`Total Applications: ${stats.total}`);
  console.log(`Approved: ${stats.approved}`);
  console.log(`Rejected: ${stats.rejected}`);
  console.log(`Pending: ${stats.pending}`);
  console.log(`Locked: ${stats.locked}`);
  console.log('');
}

async function searchApplications(db, query) {
  const applications = await db.all(`
    SELECT 
      id,
      name,
      mobile,
      email,
      document_type,
      document_number,
      status,
      created_at
    FROM kyc_applications
    WHERE 
      name LIKE ? OR
      mobile LIKE ? OR
      email LIKE ? OR
      document_number LIKE ?
    ORDER BY created_at DESC
    LIMIT 20
  `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);
  
  if (applications.length === 0) {
    console.log(`No applications found matching: ${query}`);
    return;
  }
  
  console.log(`\nFound ${applications.length} matching application(s):\n`);
  console.table(applications);
}

function showHelp() {
  console.log(`
KYC Database CLI Tool
====================

Usage: node database/db.js <command> [arguments]

Commands:
  list [limit]              List all applications (default: 50)
  get <id|mobile|doc>       Get application by ID, mobile, or document number
  add <name> <mobile> <email> <doc_type> <doc_number> [status]
                            Add a new application
  update <id> <field> <value>
                            Update an application field
  delete <id>               Delete an application
  search <query>            Search applications by name, mobile, email, or document
  stats                     Show database statistics
  help                      Show this help message

Examples:
  node database/db.js list
  node database/db.js get KYC-1234567890
  node database/db.js add "John Doe" "9876543210" "john@example.com" "aadhaar" "1234-5678-9012"
  node database/db.js update KYC-1234567890 status approved
  node database/db.js search "9876543210"
  node database/db.js stats

Database file: database/kyc.db
  `);
}

main().catch(console.error);

