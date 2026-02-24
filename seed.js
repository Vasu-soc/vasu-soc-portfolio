const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for seeding...'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Schemas (Replicating from server.js for the script)
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
    streaks: [{ title: String, icon: String, label: String, url: String }],
    learningBadges: [{ title: String, icon: String, label: String, url: String }]
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

const Certificate = mongoose.model('Certificate', certificateSchema);
const Badge = mongoose.model('Badge', badgeSchema);
const Project = mongoose.model('Project', projectSchema);
const Timeline = mongoose.model('Timeline', timelineSchema);

const seedData = async () => {
    try {
        // Clear existing data
        await Promise.all([
            Certificate.deleteMany({}),
            Badge.deleteMany({}),
            Project.deleteMany({}),
            Timeline.deleteMany({})
        ]);

        // Seed Timeline
        await Timeline.create([
            {
                year: '2026',
                title: 'SOC Analyst Path & Consistent Self-Learning',
                description: 'Committed to becoming a SOC Analyst by following a disciplined, daily self-learning routine. Actively shared learning progress and insights on LinkedIn. Built multiple hands-on mini projects, including log analysis and SOC simulation work, to strengthen practical skills.',
                icon: 'fas fa-microscope',
                tags: ['SOC Analyst', 'Self-Learning', 'Projects', 'LinkedIn', 'Consistency'],
                side: 'left'
            },
            {
                year: '2025',
                title: 'Ethical Hacking & Cybersecurity Course + Hackathon Achievement',
                description: 'Enrolled in a 6-month Ethical Hacking and Cybersecurity course at SkillsUprise (July–December). Successfully completed the program with hands-on training in security concepts and practical techniques. Participated in a malware-focused hackathon conducted during the course and secured 2nd place, earning a cash prize of ₹3000.',
                icon: 'fas fa-trophy',
                tags: ['Ethical Hacking', 'Cybersecurity', 'Hackathon', 'Malware', 'SkillsUprise'],
                side: 'right'
            },
            {
                year: '2024',
                title: 'Cybersecurity Journey Began',
                description: 'Started exploring cybersecurity by understanding how it works in the real world. Researched core concepts such as threats, vulnerabilities, attacks, and how data flows across systems and networks. Built a strong base by learning how security applies to real-world environments.',
                icon: 'fas fa-rocket',
                tags: ['Research', 'Fundamentals', 'Networking Basics', 'Security Concepts'],
                side: 'left'
            }
        ]);

        // Seed Projects
        await Project.create([
            {
                type: 'mini',
                title: 'Log Generator',
                description: 'A Python-based log generator designed to simulate realistic security events for testing SIEM and log analysis tools.',
                icon: 'fas fa-code',
                githubUrl: 'https://github.com/Vasu14-21/log_generator'
            },
            {
                type: 'big',
                title: 'Ransomware Outbreak — Lateral Movement Detection',
                description: 'Detected a ransomware campaign spreading via SMB exploits — correlated Splunk alerts, isolated infected hosts, and documented IOCs within 8-minute MTTR.',
                icon: 'fas fa-skull-crossbones',
                caseId: 'CASE-0x01',
                severity: 'HIGH',
                status: 'Resolved',
                mttr: '8 min',
                stats: '12 Hosts Affected',
                siem: 'Splunk SIEM',
                tags: ['Ransomware', 'SMB', 'Splunk', 'MTTR'],
                mitre: ['T1486 – Data Encrypted', 'T1021.002 – SMB'],
                modalId: '1'
            }
        ]);

        // Seed Certificates
        await Certificate.create([
            {
                id: 'skillsuprise-01',
                title: 'Ethical Hacking & Cyber Security',
                provider: 'SkillsUprise',
                description: '6-Month Integrated Training and Internship Program covering industry-standard defense and offense.',
                date: '2025',
                pdfUrl: 'assets/certs/skillsuprise_cert.png',
                color: 'green',
                ribbon: 'Verified'
            },
            {
                id: 'thm-presec',
                title: 'Pre-Security',
                provider: 'TryHackMe',
                description: 'Network Fundamentals, How the Web Works, and basic Operating Systems concepts.',
                date: '2026',
                pdfUrl: 'assets/certs/thm_pre_security.pdf',
                color: 'cyan',
                ribbon: 'Foundational'
            },
            {
                id: 'thm-intro',
                title: 'Advent of Cyber 2025',
                provider: 'TryHackMe',
                description: 'Exploring Careers, Offensive Security basics, and Defensive Security fundamentals.',
                date: '2025',
                pdfUrl: 'assets/certs/thm_intro_cyber.pdf',
                color: 'blue',
                ribbon: 'Foundational'
            }
        ]);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
