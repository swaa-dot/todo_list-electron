const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database');
const { create } = require('domain');

let mainWindow;

//jalankan seeder untuk kategori dan tag
require(path.join(__dirname, 'seeder', 'category'));
require(path.join(__dirname, 'seeder', 'tag'));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('./view/index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

// IPC Handlers
ipcMain.handle('get-todos', async () => {
  return new Promise((resolve) => {
    db.getTodos((todos) => {
      resolve(todos);
    });
  });
});

ipcMain.handle('add-todo', async (event, task) => {
  return new Promise((resolve) => {
    db.addTodo(task, (success) => {
      resolve(success);
    });
  });
});

ipcMain.handle('update-todo', async (event, id, newTask)=>{
    return new Promise((resolve)=> {
        db.updateTodo(id, newTask, (success)=>{
            resolve(success);
        });
    });
});

ipcMain.handle('delete-todo', async (event, id) => {
  return new Promise((resolve) => {
    db.deleteTodo(id, (success) => {
      resolve(success);
    });
  });
});

ipcMain.handle('toggle-todo', async (event, id, completed) => {
  return new Promise((resolve) => {
    db.toggleTodo(id, completed, (success) => {
      resolve(success);
    });
  });
});

ipcMain.handle('get-categories', async () => {
    return new Promise((resolve) => {
        db.getCategories((categories) => {
            resolve(categories);
        });
    });
});

ipcMain.handle('get-tags', async () => {
    return new Promise((resolve) => {
        db.getTags((tags) => {
            resolve(tags);
        });
    });
});

ipcMain.handle('add-todo-with-category-and-tags', async (event, task, categoryId, tagIds) => {
    return new Promise((resolve) => {
        db.addTodoWithCategoryAndTags(task, categoryId, tagIds, (success) => {
            resolve(success);
        });
    });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});