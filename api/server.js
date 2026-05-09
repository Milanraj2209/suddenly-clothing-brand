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
        let defaultData = [];
        if (filename === 'config.json') defaultData = { isLocked: false };
        if (filename === 'categories.json') defaultData = [
            { id: 1, name: 'New Arrivals', slug: 'new', image: 'category_new.png' },
            { id: 2, name: 'Knitwear', slug: 'knitwear', image: 'knitwear.png' }
        ];
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

// --- API ROUTES ---

// Test & Health
app.get(['/api/test', '/test'], (req, res) => res.json({ success: true, message: 'API is Live!' }));

// --- PRODUCTS ---
app.get(['/api/products', '/products'], (req, res) => {
    const products = readData('products.json');
    const { category } = req.query;
    res.json(category ? products.filter(p => p.category === category) : products);
});

app.post(['/api/products', '/products'], authMiddleware, (req, res) => {
    const products = readData('products.json');
    const newProduct = { id: Date.now(), inventory: 10, ...req.body };
    products.push(newProduct);
    writeData('products.json', products);
    res.status(201).json(newProduct);
});

app.put(['/api/products/:id', '/products/:id'], authMiddleware, (req, res) => {
    const products = readData('products.json');
    const index = products.findIndex(p => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Product not found' });
    products[index] = { ...products[index], ...req.body };
    writeData('products.json', products);
    res.json(products[index]);
});

app.delete(['/api/products/:id', '/products/:id'], authMiddleware, (req, res) => {
    let products = readData('products.json');
    products = products.filter(p => p.id != req.params.id);
    writeData('products.json', products);
    res.json({ message: 'Product deleted' });
});

// --- CATEGORIES ---
app.get(['/api/categories', '/categories'], (req, res) => res.json(readData('categories.json')));

app.post(['/api/categories', '/categories'], authMiddleware, (req, res) => {
    const categories = readData('categories.json');
    const newCategory = { id: Date.now(), ...req.body };
    categories.push(newCategory);
    writeData('categories.json', categories);
    res.status(201).json(newCategory);
});

app.delete(['/api/categories/:id', '/categories/:id'], authMiddleware, (req, res) => {
    let categories = readData('categories.json');
    categories = categories.filter(c => c.id != req.params.id);
    writeData('categories.json', categories);
    res.json({ message: 'Category deleted' });
});

// --- COUPONS ---
app.get(['/api/coupons', '/coupons'], authMiddleware, (req, res) => res.json(readData('coupons.json')));

app.post(['/api/coupons', '/coupons'], authMiddleware, (req, res) => {
    const coupons = readData('coupons.json');
    const newCoupon = { id: Date.now(), ...req.body };
    coupons.push(newCoupon);
    writeData('coupons.json', coupons);
    res.status(201).json(newCoupon);
});

app.delete(['/api/coupons/:id', '/coupons/:id'], authMiddleware, (req, res) => {
    let coupons = readData('coupons.json');
    coupons = coupons.filter(c => c.id != req.params.id);
    writeData('coupons.json', coupons);
    res.json({ message: 'Coupon deleted' });
});

// --- ORDERS ---
app.get(['/api/orders', '/orders'], authMiddleware, (req, res) => res.json(readData('orders.json')));

app.put(['/api/orders/:id', '/orders/:id'], authMiddleware, (req, res) => {
    const orders = readData('orders.json');
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Order not found' });
    orders[index] = { ...orders[index], ...req.body };
    writeData('orders.json', orders);
    res.json(orders[index]);
});

// --- USERS ---
app.get(['/api/users', '/users'], authMiddleware, (req, res) => res.json(readData('users.json')));

// --- CONFIG ---
app.get(['/api/config', '/config'], (req, res) => res.json(readData('config.json')));

app.put(['/api/config', '/config'], authMiddleware, (req, res) => {
    const config = { ...readData('config.json'), ...req.body };
    writeData('config.json', config);
    res.json(config);
});

// --- AUTH ---
app.post(['/api/admin/login', '/admin/login'], (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) res.json({ success: true, token: SECRET_TOKEN });
    else res.status(401).json({ success: false });
});

app.post(['/api/upload', '/upload'], authMiddleware, upload.single('image'), (req, res) => {
    res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

app.get(['/api/uploads', '/uploads'], authMiddleware, (req, res) => {
    fs.readdir(UPLOADS_DIR, (err, files) => {
        if (err) return res.status(500).json({ message: 'Error reading uploads' });
        res.json(files.map(file => `/uploads/${file}`));
    });
});

app.delete(['/api/uploads/:filename', '/uploads/:filename'], authMiddleware, (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'File deleted' });
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

export default app;
