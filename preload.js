const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getTodos: () => ipcRenderer.invoke('get-todos'),
    addTodoWithCategoryAndTags: (task, categoryId, tagIds) => ipcRenderer.invoke('add-todo-with-category-and-tags', task, categoryId, tagIds),
    getCategories: () => ipcRenderer.invoke('get-categories'),
    getTags: () => ipcRenderer.invoke('get-tags'),
    addTodo: (task) => ipcRenderer.invoke('add-todo', task),
    updateTodo: (id, newTask) => ipcRenderer.invoke('update-todo', id, newTask),
    deleteTodo: (id) => ipcRenderer.invoke('delete-todo', id),
    toggleTodo: (id, completed) => ipcRenderer.invoke('toggle-todo', id, completed)
});