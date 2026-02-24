const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Schemas
const contactSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    subject: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const certificateSchema = new mongoose.Schema({
    id: String,
    title: String,
    provider: String,
    description: String,
    date: String,
    pdfUrl: String,
    color: String,
    ribbon: String
});

const badgeSchema = new mongoose.Schema({
    platform: String,
    name: String,
    icon: String,
    url: String,
    iframeUrl: String,
    stats: [String],
    streaks: [{
        title: String,
        icon: String,
        label: String,
        url: String
    }],
    learningBadges: [{
        title: String,
        icon: String,
        label: String,
        url: String
    }]
});

const projectSchema = new mongoose.Schema({
    type: { type: String, enum: ['mini', 'big'] },
    title: String,
    description: String,
    icon: String,
    githubUrl: String,
    severity: String,
    status: String,
    caseId: String,
    mttr: String,
    stats: String,
    siem: String,
    tags: [String],
    mitre: [String],
    modalId: String
});

const timelineSchema = new mongoose.Schema({
    year: String,
    title: String,
    description: String,
    icon: String,
    tags: [String],
    side: { type: String, enum: ['left', 'right'] }
});

const Contact = mongoose.model('Contact', contactSchema);
const Certificate = mongoose.model('Certificate', certificateSchema);
const Badge = mongoose.model('Badge', badgeSchema);
const Project = mongoose.model('Project', projectSchema);
const Timeline = mongoose.model('Timeline', timelineSchema);

// Routes
app.post('/api/contact', async (req, res) => {
    try {
        const { fname, lname, email, subject, message } = req.body;
        const newContact = new Contact({
            firstName: fname,
            lastName: lname,
            email,
            subject,
            message
        });
        await newContact.save();
        res.status(201).json({ success: true, message: 'Message saved successfully' });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ success: false, error: 'Failed to save message' });
    }
});

app.get('/api/certificates', async (req, res) => {
    try {
        const certs = await Certificate.find();
        res.json(certs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/badges', async (req, res) => {
    try {
        const badges = await Badge.find();
        res.json(badges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/timeline', async (req, res) => {
    try {
        const timeline = await Timeline.find().sort({ year: -1 });
        res.json(timeline);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Hello route for testing
app.get('/', (req, res) => {
    res.send('SOC Portfolio Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
