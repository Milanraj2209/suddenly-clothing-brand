import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'api', 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'api', 'uploads');

[DATA_DIR, UPLOADS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage: storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const readData = (filename) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        const defaultData = filename === 'config.json' ? { isLocked: false } : [];
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    return JSON.parse(fs.readFileSync(filePath));
};

const writeData = (filename, data) => fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));

const ADMIN_PASSWORD = 'aura2024';
const SECRET_TOKEN = 'aura_secure_session_2024';

const authMiddleware = (req, res, next) => {
    if (req.headers['x-admin-token'] === SECRET_TOKEN) return next();
    res.status(401).json({ message: 'Unauthorized' });
};

// --- API ---
app.get(['/api/test', '/test'], (req, res) => res.json({ success: true, message: 'API is Live!' }));

app.get(['/api/products', '/products'], (req, res) => {
    const products = readData('products.json');
    const { category } = req.query;
    res.json(category ? products.filter(p => p.category === category) : products);
});

app.post(['/api/products', '/products'], authMiddleware, (req, res) => {
    const products = readData('products.json');
    const newProduct = { id: Date.now(), inventory: 5, ...req.body };
    products.push(newProduct);
    writeData('products.json', products);
    res.status(201).json(newProduct);
});

app.get(['/api/categories', '/categories'], (req, res) => res.json(readData('categories.json')));
app.get(['/api/config', '/config'], (req, res) => res.json(readData('config.json')));

app.post(['/api/admin/login', '/admin/login'], (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) res.json({ success: true, token: SECRET_TOKEN });
    else res.status(401).json({ success: false });
});

app.post(['/api/upload', '/upload'], authMiddleware, upload.single('image'), (req, res) => {
    res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

export default app;
