const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper functions to handle JSON data
const readData = (filename) => {
    const filePath = path.join(__dirname, 'data', filename);
    
    // Ensure the data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // If file doesn't exist, create it with default data
    if (!fs.existsSync(filePath)) {
        // Special case for config.json
        const defaultData = filename === 'config.json' ? { isLocked: false } : [];
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }

    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
};

const writeData = (filename, data) => {
    const filePath = path.join(__dirname, 'data', filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Admin Security
const ADMIN_PASSWORD = 'aura2024';
const SECRET_TOKEN = 'aura_secure_session_2024';

// Auth Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers['x-admin-token'];
    if (token === SECRET_TOKEN) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized: Admin access required' });
    }
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const users = readData('users.json');

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now(),
            name,
            email,
            password: hashedPassword
        };

        users.push(newUser);
        writeData('users.json', users);

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ success: true, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = readData('users.json');
        const user = users.find(u => u.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

// API Routes
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: SECRET_TOKEN });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

app.get('/api/products', (req, res) => {
    try {
        const products = readData('products.json');
        const { category } = req.query;
        
        if (category) {
            const filtered = products.filter(p => p.category === category);
            return res.json(filtered);
        }
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Protected Admin Routes
app.post('/api/products', authMiddleware, (req, res) => {
    try {
        const product = req.body;
        const products = readData('products.json');
        
        const newProduct = {
            id: Date.now(),
            inventory: product.inventory !== undefined ? parseInt(product.inventory) : 5,
            ...product
        };
        
        products.push(newProduct);
        writeData('products.json', products);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product' });
    }
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        let products = readData('products.json');
        products = products.filter(p => p.id != id);
        writeData('products.json', products);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        let products = readData('products.json');
        
        const index = products.findIndex(p => p.id == id);
        if (index === -1) return res.status(404).json({ message: 'Product not found' });
        
        if (updates.inventory !== undefined) {
            updates.inventory = parseInt(updates.inventory);
        }

        products[index] = { ...products[index], ...updates };
        writeData('products.json', products);
        res.json(products[index]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Image Upload Endpoint
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, url: imageUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image' });
    }
});

app.get('/api/uploads', (req, res) => {
    try {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            return res.json([]);
        }
        const files = fs.readdirSync(uploadDir);
        const imageUrls = files.map(file => `/uploads/${file}`);
        res.json(imageUrls);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images' });
    }
});

app.delete('/api/uploads/:filename', authMiddleware, (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, 'uploads', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image' });
    }
});

app.get('/api/categories', (req, res) => {
    try {
        const categories = readData('categories.json');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Store Configuration Routes
app.get('/api/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, 'data', 'config.json');
        if (!fs.existsSync(configPath)) {
            return res.json({ isLocked: false });
        }
        const config = readData('config.json');
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching config' });
    }
});

app.put('/api/config', authMiddleware, (req, res) => {
    try {
        const { isLocked, homePage } = req.body;
        const config = readData('config.json');
        
        if (isLocked !== undefined) config.isLocked = Boolean(isLocked);
        if (homePage !== undefined) config.homePage = homePage;

        writeData('config.json', config);
        res.json({ message: 'Configuration updated', config });
    } catch (error) {
        res.status(500).json({ message: 'Error updating config' });
    }
});

// Coupon Routes
app.post('/api/coupons/validate', (req, res) => {
    try {
        const { code } = req.body;
        const coupons = readData('coupons.json');
        const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
        
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }
        
        res.json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ message: 'Error validating coupon' });
    }
});

app.get('/api/admin/coupons', authMiddleware, (req, res) => {
    try {
        const coupons = readData('coupons.json');
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons' });
    }
});

// Authentication (OTP based)
app.post('/api/auth/send-otp', (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ success: false, message: 'Phone number required' });
        
        // Mock sending OTP
        console.log(`Mock: Sent OTP to ${phone}`);
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/auth/verify-otp', (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP required' });
        
        // Mock verification: allow any 6 digit OTP for testing
        if (otp.length < 4) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const users = readData('users.json');
        let user = users.find(u => u.phone === phone);
        
        if (!user) {
            // Register new user
            user = {
                id: Date.now(),
                name: `User ${phone.slice(-4)}`,
                phone: phone,
                email: `${phone}@suddenly.demo`
            };
            users.push(user);
            writeData('users.json', users);
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Protected Admin Order Routes
app.get('/api/orders', authMiddleware, (req, res) => {
    try {
        const orders = readData('orders.json');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// User Order History
app.get('/api/users/:userId/orders', (req, res) => {
    try {
        const { userId } = req.params;
        const orders = readData('orders.json');
        
        // Filter orders for this user and sort by newest first (assuming newest have higher IDs or we can parse date)
        const userOrders = orders.filter(o => o.userId == userId);
        
        res.json(userOrders.reverse()); 
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user orders' });
    }
});

app.post('/api/order', (req, res) => {
    try {
        const { items, total, customer, userId } = req.body;
        let products = readData('products.json');
        const orders = readData('orders.json');
        
        // Stock Validation
        for (const item of items) {
            const product = products.find(p => p.id == item.id);
            if (product && product.inventory < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
            }
        }
        
        // Decrement Stock
        for (const item of items) {
            const productIndex = products.findIndex(p => p.id == item.id);
            if (productIndex !== -1) {
                products[productIndex].inventory -= item.quantity;
            }
        }
        writeData('products.json', products);

        const newOrder = {
            id: `ORD-${Math.floor(Math.random() * 1000000)}`,
            userId: userId || null,
            customer: customer || 'Guest',
            items,
            total,
            status: 'Pending',
            date: new Date().toLocaleString()
        };

        orders.push(newOrder);
        writeData('orders.json', orders);
        
        res.status(201).json({ 
            message: 'Order placed successfully!', 
            orderId: newOrder.id 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing order' });
    }
});


app.put('/api/orders/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const orders = readData('orders.json');
        
        const orderIndex = orders.findIndex(o => o.id === id);
        if (orderIndex === -1) return res.status(404).json({ message: 'Order not found' });
        
        orders[orderIndex].status = status;
        writeData('orders.json', orders);
        
        res.json({ message: 'Order updated successfully', order: orders[orderIndex] });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order' });
    }
});

app.post('/api/orders/manual', authMiddleware, (req, res) => {
    try {
        const { items, total, status, customer } = req.body;
        let products = readData('products.json');
        const orders = readData('orders.json');
        
        // Admin orders bypass strict stock validation, but we try to decrement if matched by name or ID
        // Assuming items here might just have names since they are manual. If they have ID, we decrement.
        for (const item of items) {
            const productIndex = products.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase());
            if (productIndex !== -1) {
                // Deduct 1 for manual entries if quantity is not provided
                products[productIndex].inventory = Math.max(0, products[productIndex].inventory - (item.quantity || 1));
            }
        }
        writeData('products.json', products);

        const newOrder = {
            id: `ORD-ADM-${Math.floor(Math.random() * 1000000)}`,
            customer: customer || 'Admin Entry',
            items,
            total,
            status: status || 'Pending',
            date: new Date().toLocaleString()
        };

        orders.push(newOrder);
        writeData('orders.json', orders);
        
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error adding manual order' });
    }
});


// Reviews API
app.get('/api/reviews/:productId', (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = readData('reviews.json');
        const productReviews = reviews.filter(r => r.productId == productId);
        res.json(productReviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

app.post('/api/reviews', (req, res) => {
    try {
        const { productId, user, rating, comment } = req.body;
        const reviews = readData('reviews.json');
        
        const newReview = {
            id: Date.now(),
            productId,
            user: user || 'Anonymous',
            rating: parseInt(rating) || 5,
            comment,
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        };

        reviews.push(newReview);
        writeData('reviews.json', reviews);
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: 'Error posting review' });
    }
});


// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
