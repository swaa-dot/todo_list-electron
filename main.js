const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database');
const { create } = require('domain');

let mainWindow;

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
    db.getAllTodos((todos) => {
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

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});