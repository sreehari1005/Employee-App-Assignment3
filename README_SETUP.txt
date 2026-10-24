ASSIGNMENT 3 - EMPLOYEE APP BACKEND

1. Open the Casestudy2 folder in VS Code.
2. Install Node.js LTS if it is not already installed.
3. In the VS Code terminal, run:
   npm install
4. In MongoDB Atlas, create a database user and allow your current IP address in Network Access.
   Copy the Atlas connection string.
5. Copy .env.example to a new file named .env. Replace the placeholder MONGODB_URI with your real
   Atlas connection string and choose a database name. Do not commit .env to GitHub.
6. Start the app:
   npm start
7. Open http://localhost:3000

API endpoints:
GET    /api/employeelist
GET    /api/employeelist/:id
POST   /api/employeelist
PUT    /api/employeelist   (request body must include _id)
DELETE /api/employeelist/:id

The backend also supports /employeelist aliases for compatibility with the supplied build.
The dist folder has not been edited. Only app.js was completed; package.json and setup notes were added.
Before submitting the GitHub repository, add .env to .gitignore and never publish your Atlas password.
