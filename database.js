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
  db.run("PRAGMA foreign_keys = ON");

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

  // Tabel categories
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

  // Tabel tags
  db.run(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

   // Tambah kolom category_id hanya jika belum ada
  db.all(`PRAGMA table_info(todos)`, (err, columns) => {
    if (err) {
      console.error(err.message);
      return;
    }

      if (!columns.some(col => col.name === 'category_id')) {
        db.run(`ALTER TABLE todos ADD COLUMN category_id INTEGER`);
      }
    });

  // Tabel penghubung todo-tags
  db.run(`CREATE TABLE IF NOT EXISTS todo_tags (
    todo_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (todo_id, tag_id),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  )`);
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
  db.serialize(() => {
    // Hapus relasi tag dulu
    db.run("DELETE FROM todo_tags WHERE todo_id = ?", [id], function(err) {
      if (err) {
        console.error(err.message);
        callback(false);
        return;
      }

      // Baru hapus todo
      db.run("DELETE FROM todos WHERE id = ?", [id], function(err) {
        if (err) {
          console.error(err.message);
          callback(false);
        } else {
          callback(true);
        }
      });
    });
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

// Tambah kategori
function addCategory(name, callback) {
  db.run("INSERT INTO categories (name) VALUES (?)", [name], function(err) {
    if (err) {
       if (err.message.includes('UNIQUE constraint failed')){
        return callback({success:false, error:`Category '${name}' already exits.`})
      }
      console.error(err.message);
      callback({success: false, error: err.message});
    } else {
      console.log(`Added new category: ${name} (id: ${this.lastID})`);
      callback({success: true, id:this.lastID});
    }
  });
}

// Tambah tag
function addTag(name, callback) {
  db.run("INSERT INTO tags (name) VALUES (?)", [name], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')){
        return callback({success:false, error:`Tag '${name}' already exits.`})
      }
      console.error(err.message);
      callback({success: false, error: err.message});
    } else {
      console.log(`Added new tag: ${name} (id: ${this.lastID})`);
      callback({success: true, id:this.lastID});
    }
  });
}

// Hubungkan todo ke tag
function addTagToTodo(todoId, tagId, callback) {
  db.run("INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)", [todoId, tagId], function(err) {
    if (err) {
      console.error(err.message);
      callback(false);
    } else {
      callback(true);
    }
  });
}

function getCategories(callback) {
    db.all("SELECT * FROM categories ORDER BY name ASC", [], (err, rows) => {
        if(err) {
            console.error(err.message);
            callback([]);
        } else callback(rows);
    });
}

function getTags(callback) {
    db.all("SELECT * FROM tags ORDER BY name ASC", [], (err, rows) => {
        if(err) {
            console.error(err.message);
            callback([]);
        } else callback(rows);
    });
}

function addTodoWithCategoryAndTags(task, categoryId, tagIds, callback) {
  db.serialize(() => {
    db.run("INSERT INTO todos (task, category_id) VALUES (?, ?)", 
      [task, categoryId || null], 
      function(err) {
        if (err) {
          console.error(err.message);
          return callback(false);
        }
        
        const todoId = this.lastID;
        if (!tagIds || tagIds.length === 0) {
          return callback(true);
        }

        // Gunakan prepared statement untuk multiple inserts
        const stmt = db.prepare("INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)");
        tagIds.forEach(tagId => {
          stmt.run(todoId, tagId);
        });
        stmt.finalize(err => {
          if (err) {
            console.error(err.message);
            return callback(false);
          }
          callback(true);
        });
      });
  });
}

function updateTodoCategory(todoId, categoryId, callback) {
  db.run("UPDATE todos SET category_id = ? WHERE id = ?", 
    [categoryId || null, todoId], 
    function(err) {
      if (err) {
        console.error(err.message);
        callback(false);
      } else {
        callback(true);
      }
    }
  );
}

function updateTodoTags(todoId, tagIds, callback) {
  db.serialize(() => {
    // Hapus semua tag yang ada
    db.run("DELETE FROM todo_tags WHERE todo_id = ?", [todoId], function(err) {
      if (err) {
        console.error(err.message);
        return callback(false);
      }

      // Tambahkan tag baru jika ada
      if (!tagIds || tagIds.length === 0) {
        return callback(true);
      }

      const stmt = db.prepare("INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)");
      tagIds.forEach(tagId => {
        stmt.run(todoId, tagId);
      });
      stmt.finalize(err => {
        if (err) {
          console.error(err.message);
          return callback(false);
        }
        callback(true);
      });
    });
  });
}

function getTodos(callback) {
  const sql = `
    SELECT 
      todos.id,
      todos.task,
      todos.completed,
      categories.id as category_id,
      categories.name as category_name,
      tags.id as tag_id,
      tags.name as tag_name
    FROM todos
    LEFT JOIN categories ON todos.category_id = categories.id
    LEFT JOIN todo_tags ON todos.id = todo_tags.todo_id
    LEFT JOIN tags ON todo_tags.tag_id = tags.id
    ORDER BY todos.created_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      callback([]);
      return;
    }

    // Transformasi data untuk menggabungkan tag yang sama
    const todosMap = new Map();
    rows.forEach(row => {
      if (!todosMap.has(row.id)) {
        todosMap.set(row.id, {
          id: row.id,
          task: row.task,
          completed: row.completed,
          category: row.category_id ? {
            id: row.category_id,
            name: row.category_name
          } : null,
          tags: []
        });
      }
      
      if (row.tag_id) {
        todosMap.get(row.id).tags.push({
          id: row.tag_id,
          name: row.tag_name
        });
      }
    });

    callback(Array.from(todosMap.values()));
  });
}


module.exports = {
  db,
  getAllTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  addCategory,
  addTag,
  addTagToTodo,
  addTodoWithCategoryAndTags,
  updateTodoCategory,
  updateTodoTags,
  getCategories,
  getTags,
  getTodos
};