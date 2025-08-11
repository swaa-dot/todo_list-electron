const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

// Path untuk database
const dbPath = path.join(__dirname, 'todos.db');
console.log('Database path:', dbPath);

// Buat koneksi database
let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Inisialisasi database
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating table', err.message);
    }
  });
}

// Fungsi untuk mendapatkan semua todos
function getAllTodos(callback) {
  db.all("SELECT * FROM todos ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      callback([]);
    } else {
      callback(rows);
    }
  });
}

// Fungsi untuk menambahkan todo baru
function addTodo(task, callback) {
  db.run("INSERT INTO todos (task) VALUES (?)", [task], function(err) {
    if (err) {
      console.error(err.message);
      callback(false);
    } else {
      callback(true);
    }
  });
}

function updateTodo(id, newTask, callback){
    db.run("UPDATE todos SET task = ? WHERE id = ?", [newTask, id], function(err){
        if (err){
            console.error(err.message);
            callback(false);
        } else {
            callback(true);
        }
    });
}

// Fungsi untuk menghapus todo
function deleteTodo(id, callback) {
  db.run("DELETE FROM todos WHERE id = ?", [id], function(err) {
    if (err) {
      console.error(err.message);
      callback(false);
    } else {
      callback(true);
    }
  });
}

// Fungsi untuk mengupdate status todo
function toggleTodo(id, completed, callback) {
  db.run("UPDATE todos SET completed = ? WHERE id = ?", [completed, id], function(err) {
    if (err) {
      console.error(err.message);
      callback(false);
    } else {
      callback(true);
    }
  });
}

module.exports = {
  getAllTodos,
  addTodo,
updateTodo,
  deleteTodo,
  toggleTodo
};