import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ordersPath = path.join(__dirname, '..', 'server', 'data', 'orders.json');
const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));

const testOrder = {
    id: "ORD-ADM-TEST-123",
    customer: "Julia (Verified)",
    items: [{ name: "Handmade Scarf" }],
    total: "$120",
    status: "Pending",
    date: new Date().toLocaleString()
};

orders.push(testOrder);
fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
console.log("Order added successfully!");
