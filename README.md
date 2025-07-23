# 📝 ToDo List - Desktop App with Electron

A simple ToDo List desktop application built with [Electron](https://www.electronjs.org/). This project allows you to create, edit, and manage your daily tasks offline as a lightweight desktop app.

---

## 📦 Features

- Add, update, and delete tasks
- Persistent storage (optional if added)
- Desktop application feel
- Cross-platform (Windows, Mac, Linux)

---

## 🚀 How to Run

### 1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/todo_list-electron.git
cd todo_list-electron
2. Install Dependencies
Make sure Node.js & npm are installed.
Then install the project dependencies:

bash
Copy
Edit
npm install
3. Run the App in Development Mode
bash
Copy
Edit
npm start
🛠 Requirements
Tool	Version
Node.js	v14+ or v16+ recommended
npm	v6+
Electron	Installed via package.json dependencies

🏗 Packaging for Production
If you want to build a standalone executable:

bash
Copy
Edit
npm run build
Or (depending on the config):

bash
Copy
Edit
npx electron-packager . todo-list --platform=win32 --arch=x64
⚠️ Make sure you have electron-packager installed:

bash
Copy
Edit
npm install --save-dev electron-packager
📁 File Structure
bash
Copy
Edit
todo-list-electron/
│
├── main.js             # Main Electron process
├── index.html          # Frontend HTML
├── renderer.js         # Frontend JS (if any)
├── package.json        # Project metadata
└── .gitignore          # Ignore node_modules, etc.
