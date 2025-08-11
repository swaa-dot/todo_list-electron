const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getTodos: () => ipcRenderer.invoke('get-todos'),
    addTodo: (task) => ipcRenderer.invoke('add-todo', task),
    updateTodo: (id, newTask) => ipcRenderer.invoke('update-todo', id, newTask),
    deleteTodo: (id) => ipcRenderer.invoke('delete-todo', id),
    toggleTodo: (id, completed) => ipcRenderer.invoke('toggle-todo', id, completed)
});