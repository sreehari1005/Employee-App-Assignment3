// Assignment 3: Employee App Backend Integration
// Configure MONGODB_URI in your environment (see .env.example).
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Task1: initiate app and run server at 3000

const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));
// Task2: create mongoDB connection 

// Connect to MongoDB Atlas. Set MONGODB_URI in a .env file or environment variable.
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('Missing MONGODB_URI. Add your MongoDB Atlas connection string to .env.');
    process.exit(1);
}

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
}, { versionKey: false });

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => {
        console.error('MongoDB Atlas connection failed:', error.message);
        process.exit(1);
    });




//Task 2 : write api with error handling and appropriate api mentioned in the TODO below







//TODO: get data from db  using api '/api/employeelist'
const asyncHandler = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

// GET all employees
app.get(['/api/employeelist', '/employeelist'], asyncHandler(async (req, res) => {
    const employees = await Employee.find().sort({ name: 1 });
    res.status(200).json(employees);
}));




//TODO: get single data from db  using api '/api/employeelist/:id'
// GET one employee by MongoDB id
app.get(['/api/employeelist/:id', '/employeelist/:id'], asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid employee id' });
    }
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
}));





//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

// POST: add a new employee. Keep the original frontend's /api/employeelist endpoint.
app.post(['/api/employeelist', '/employeelist'], asyncHandler(async (req, res) => {
    const { name, location, position, salary } = req.body || {};
    if (![name, location, position].every(value => typeof value === 'string' && value.trim()) ||
        salary === undefined || salary === null || salary === '' || !Number.isFinite(Number(salary)) || Number(salary) < 0) {
        return res.status(400).json({ message: 'Please provide name, location, position, and a valid non-negative salary.' });
    }
    const employee = await Employee.create({
        name: name.trim(), location: location.trim(), position: position.trim(), salary: Number(salary)
    });
    res.status(201).json(employee);
}));






//TODO: delete a employee data from db by using api '/api/employeelist/:id'
// DELETE one employee
app.delete(['/api/employeelist/:id', '/employeelist/:id'], asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid employee id' });
    }
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee deleted successfully', employee });
}));





//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

// PUT: update an employee. The provided frontend sends the employee object to /api/employeelist.
// Accept _id (MongoDB) or id in the request body; no frontend build changes are needed.
app.put(['/api/employeelist', '/employeelist'], asyncHandler(async (req, res) => {
    const body = req.body || {};
    const id = body._id || body.id;
    if (!id || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'A valid employee _id is required to update an employee.' });
    }
    const updates = {};
    for (const field of ['name', 'location', 'position']) {
        if (body[field] !== undefined) {
            if (typeof body[field] !== 'string' || !body[field].trim()) {
                return res.status(400).json({ message: `${field} must be a non-empty string.` });
            }
            updates[field] = body[field].trim();
        }
    }
    if (body.salary !== undefined) {
        if (body.salary === '' || !Number.isFinite(Number(body.salary)) || Number(body.salary) < 0) {
            return res.status(400).json({ message: 'salary must be a valid non-negative number.' });
        }
        updates.salary = Number(body.salary);
    }
    if (!Object.keys(updates).length) {
        return res.status(400).json({ message: 'Provide at least one employee field to update.' });
    }
    const employee = await Employee.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.status(200).json(employee);
}));


// Return JSON for unexpected API/database errors.
app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});




// Start the server after the MongoDB connection is established.
const PORT = process.env.PORT || 3000;
mongoose.connection.once('open', () => {
    app.listen(PORT, () => console.log(`Employee App server running at http://localhost:${PORT}`));
});
