// Import Express.js and set up the app
import express from 'express';

const __dirname = import.meta.dirname;
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Import the getProjects function from the db module
import { getProjects } from './db.js';


// Set up routes for the application
app.get('/', async (req, res) => {
    // Get projects from the database
    const ps = await getProjects();
    res.render('main', { projs: ps });
});

// Serve static files
app.use(express.static(__dirname + '/styles'));
app.use(express.static(__dirname + '/images'));

// Import and register the project router
import { router as projRouter } from './routes/project.js';
app.use('/project', projRouter);

// Start the server and listen on port 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


