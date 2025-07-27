// backend/server.js (เวอร์ชันแก้ไขสมบูรณ์)

// --- 1. นำเข้าไลบรารี ---
const { exec } = require('child_process');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// --- 2. ตั้งค่าตัวแปรหลัก ---
const app = express();
const PORT = process.env.PORT || 3001;
const SALT_ROUNDS = 10;
const JWT_SECRET = 'your_super_secret_key';

// --- 3. ตั้งค่าการเชื่อมต่อ PostgreSQL ---
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ostore_manage_db',
  password: process.env.DB_PASSWORD || '248543', // ‼️ ใช้รหัสผ่านของคุณสำหรับ Local
  port: process.env.DB_PORT || 5432,
  ssl: !!process.env.DB_HOST // เปิด SSL อัตโนมัติเมื่อ deploy
});

// --- 4. ใช้ Middlewares ---
const corsOptions = {
  origin: [
    'https://o-store-manage.vercel.app',
    'https://o-store-manage-git-main-pattaraopticalstores-projects.vercel.app',
    'http://localhost:5173'
  ]
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 5. ตั้งค่า Multer (File Upload) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- 6. สร้าง Middleware สำหรับตรวจสอบ Token ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ===================================
// ===         API ROUTES          ===
// ===================================

// --- AUTH API ---
app.post('/api/users/register', authenticateToken, async (req, res) => { try { const { username, password, full_name, role } = req.body; const password_hash = await bcrypt.hash(password, SALT_ROUNDS); const r = await pool.query("INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role", [username, password_hash, full_name, role || 'staff']); res.status(201).json(r.rows[0]); } catch (e) { res.status(500).json({ message: "Username may already exist." }) } });
app.post('/api/users/login', async (req, res) => { try { const { username, password } = req.body; const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]); if (result.rows.length === 0) { return res.status(401).json({ message: 'Invalid credentials' }); } const user = result.rows[0]; const isValid = await bcrypt.compare(password, user.password_hash); if (!isValid) { return res.status(401).json({ message: 'Invalid credentials' }); } const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' }); res.json({ token, user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role } }); } catch (e) { res.status(500).send("Server Error") } });

// --- CUSTOMERS API ---
app.get('/api/customers', authenticateToken, async (req, res) => { try { const r = await pool.query("SELECT * FROM customers ORDER BY id DESC"); res.json(r.rows); } catch (e) { res.status(500).send(e.message) } });
app.post('/api/customers', authenticateToken, async (req, res) => { try { const { firstName, lastName, phone, birthDate, address } = req.body; const r = await pool.query("INSERT INTO customers (first_name, last_name, phone, birth_date, address) VALUES ($1, $2, $3, $4, $5) RETURNING *", [firstName, lastName, phone, birthDate, address]); res.status(201).json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });
app.put('/api/customers/:id', authenticateToken, async (req, res) => { try { const { id } = req.params; const { firstName, lastName, phone, birthDate, address } = req.body; const r = await pool.query("UPDATE customers SET first_name = $1, last_name = $2, phone = $3, birth_date = $4, address = $5 WHERE id = $6 RETURNING *", [firstName, lastName, phone, birthDate, address, id]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });
app.delete('/api/customers/:id', authenticateToken, async (req, res) => { try { const { id } = req.params; await pool.query("DELETE FROM customers WHERE id = $1", [id]); res.json({ message: 'Customer deleted' }); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/customers/:id', authenticateToken, async (req, res) => { try { const { id } = req.params; const r = await pool.query("SELECT * FROM customers WHERE id = $1", [id]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });
app.put('/api/customers/:id/health-info', authenticateToken, async (req, res) => { try { const { id } = req.params; const { health_conditions, lifestyle_notes } = req.body; const r = await pool.query("UPDATE customers SET health_conditions = $1, lifestyle_notes = $2 WHERE id = $3 RETURNING *", [health_conditions, lifestyle_notes, id]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/customers/:id/invoices', authenticateToken, async (req, res) => { try { const { id } = req.params; const r = await pool.query("SELECT * FROM invoices WHERE customer_id = $1 ORDER BY invoice_date DESC", [id]); res.json(r.rows); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/customers/:id/prescriptions', authenticateToken, async (req, res) => { try { const { id } = req.params; const r = await pool.query("SELECT * FROM eye_prescriptions WHERE customer_id = $1 ORDER BY exam_date DESC", [id]); res.json(r.rows); } catch (e) { res.status(500).send(e.message) } });
app.post('/api/customers/:id/prescriptions', authenticateToken, async (req, res) => { try { const { id } = req.params; const { exam_date, examiner_name, od_sph, od_cyl, od_axis, od_add, od_prism, os_sph, os_cyl, os_axis, os_add, os_prism, pd, sh, notes } = req.body; const r = await pool.query("INSERT INTO eye_prescriptions (customer_id, exam_date, examiner_name, od_sph, od_cyl, od_axis, od_add, od_prism, os_sph, os_cyl, os_axis, os_add, os_prism, pd, sh, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *", [id, exam_date, examiner_name, od_sph, od_cyl, od_axis, od_add, od_prism, os_sph, os_cyl, os_axis, os_add, os_prism, pd, sh, notes]); res.status(201).json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });

// --- PRODUCTS API ---
app.get('/api/products', authenticateToken, async (req, res) => { try { const r = await pool.query("SELECT * FROM products WHERE is_active = true ORDER BY id DESC"); res.json(r.rows); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/products/inactive', authenticateToken, async (req, res) => { try { const r = await pool.query("SELECT * FROM products WHERE is_active = false ORDER BY id DESC"); res.json(r.rows); } catch (e) { res.status(500).send(e.message) } });
app.post('/api/products', authenticateToken, async (req, res) => { try { const { name, brand, category, cost_price, selling_price, quantity_on_hand, properties, unit_name } = req.body; const r = await pool.query("INSERT INTO products (name, brand, category, cost_price, selling_price, quantity_on_hand, properties, unit_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [name, brand, category, cost_price, selling_price, quantity_on_hand, properties, unit_name]); res.status(201).json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });
app.put('/api/products/:id', authenticateToken, async (req, res) => { try { const { id } = req.params; const { name, brand, category, cost_price, selling_price, quantity_on_hand, properties, unit_name } = req.body; const r = await pool.query("UPDATE products SET name = $1, brand = $2, category = $3, cost_price = $4, selling_price = $5, quantity_on_hand = $6, properties = $7, unit_name = $8 WHERE id = $9 RETURNING *", [name, brand, category, cost_price, selling_price, quantity_on_hand, properties, unit_name, id]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });
app.delete('/api/products/:id', authenticateToken, async (req, res) => { try { const { id } = req.params; await pool.query("UPDATE products SET is_active = false WHERE id = $1", [id]); res.json({ message: 'Product deactivated' }); } catch (e) { res.status(500).send(e.message) } });
app.post('/api/products/:id/add-stock', authenticateToken, async (req, res) => { try { const { id } = req.params; const { quantityToAdd } = req.body; const r = await pool.query("UPDATE products SET quantity_on_hand = quantity_on_hand + $1 WHERE id = $2 RETURNING *", [quantityToAdd, id]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });
app.put('/api/products/:id/reactivate', authenticateToken, async (req, res) => { try { const { id } = req.params; const r = await pool.query("UPDATE products SET is_active = true WHERE id = $1 RETURNING *", [id]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });

// --- INVOICES API ---
app.post('/api/invoices', authenticateToken, async (req, res) => { const client = await pool.connect(); try { const { customer_id, total_amount, payment_method, items, discount_amount, promotion_used } = req.body; const user_id = req.user.id; await client.query('BEGIN'); const invoiceRes = await client.query('INSERT INTO invoices (customer_id, total_amount, payment_method, discount_amount, promotion_used, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [customer_id, total_amount, payment_method, discount_amount, promotion_used, user_id]); const invoiceId = invoiceRes.rows[0].id; for (const item of items) { await client.query('INSERT INTO invoice_items (invoice_id, product_id, quantity, price_per_unit) VALUES ($1, $2, $3, $4)', [invoiceId, item.product_id, item.quantity, item.selling_price]); await client.query('UPDATE products SET quantity_on_hand = quantity_on_hand - $1 WHERE id = $2', [item.quantity, item.product_id]); } await client.query('COMMIT'); res.status(201).json({ success: true, invoiceId: invoiceId }); } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ success: false, message: 'Failed to create invoice.' }); } finally { client.release(); } });
app.get('/api/invoices', authenticateToken, async (req, res) => { try { const query = `SELECT i.id, i.invoice_date, i.total_amount, i.payment_method, c.first_name, c.last_name, u.full_name as user_name FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id LEFT JOIN users u ON i.user_id = u.id ORDER BY i.invoice_date DESC`; const r = await pool.query(query); res.json(r.rows); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/invoices/:id', authenticateToken, async (req, res) => { try { const { id } = req.params; let invoiceData = {}; const invoiceResult = await pool.query(`SELECT i.*, c.first_name, c.last_name, c.phone, c.address FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id WHERE i.id = $1`, [id]); if (invoiceResult.rows.length === 0) { return res.status(404).json({ message: 'Invoice not found' }); } invoiceData = invoiceResult.rows[0]; const itemsResult = await pool.query(`SELECT ii.quantity, ii.price_per_unit, p.name, p.brand, p.unit_name FROM invoice_items ii JOIN products p ON ii.product_id = p.id WHERE ii.invoice_id = $1`, [id]); invoiceData.items = itemsResult.rows; res.json(invoiceData); } catch (e) { res.status(500).send(e.message) } });
app.delete('/api/invoices/:id', authenticateToken, async (req, res) => { const { id } = req.params; const client = await pool.connect(); try { await client.query('BEGIN'); const itemsResult = await client.query('SELECT product_id, quantity FROM invoice_items WHERE invoice_id = $1', [id]); if (itemsResult.rows.length > 0) { for (const item of itemsResult.rows) { await client.query('UPDATE products SET quantity_on_hand = quantity_on_hand + $1 WHERE id = $2', [item.quantity, item.product_id]); } } await client.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]); await client.query('DELETE FROM invoices WHERE id = $1', [id]); await client.query('COMMIT'); res.json({ message: 'Invoice deleted' }); } catch (e) { await client.query('ROLLBACK'); res.status(500).send(e.message) } finally { client.release(); } });

// --- SHOP INFO API ---
app.get('/api/shop-info', async (req, res) => { try { const r = await pool.query("SELECT * FROM shop_info WHERE id = 1"); res.json(r.rows[0] || {}); } catch (e) { res.status(500).send(e.message) } });
app.put('/api/shop-info', authenticateToken, upload.single('logo'), async (req, res) => { try { const { shop_name, address, phone, tax_id } = req.body; const logo_path = req.file ? `/uploads/${req.file.filename}` : req.body.existing_logo_path; const r = await pool.query("UPDATE shop_info SET shop_name = $1, address = $2, phone = $3, tax_id = $4, logo_path = $5 WHERE id = 1 RETURNING *", [shop_name, address, phone, tax_id, logo_path]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });

// --- EXPENSES API ---
app.get('/api/expenses', authenticateToken, async (req, res) => { try { const r = await pool.query("SELECT * FROM expenses ORDER BY expense_date DESC"); res.json(r.rows); } catch (e) { res.status(500).send(e.message) } });
app.post('/api/expenses', authenticateToken, async (req, res) => { try { const { expense_date, category, description, amount } = req.body; const user_id = req.user.id; const r = await pool.query("INSERT INTO expenses (expense_date, category, description, amount, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", [expense_date, category, description, amount, user_id]); res.status(201).json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });
app.put('/api/expenses/:id', authenticateToken, async (req, res) => { try { const { id } = req.params; const { expense_date, category, description, amount } = req.body; const r = await pool.query("UPDATE expenses SET expense_date = $1, category = $2, description = $3, amount = $4 WHERE id = $5 RETURNING *", [expense_date, category, description, amount, id]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message) } });
app.delete('/api/expenses/:id', authenticateToken, async (req, res) => { try { const { id } = req.params; await pool.query("DELETE FROM expenses WHERE id = $1", [id]); res.json({ message: 'Expense deleted' }); } catch (e) { res.status(500).send(e.message) } });

// --- REPORTS API ---
app.get('/api/reports/sales', authenticateToken, async (req, res) => { try { const { startDate, endDate } = req.query; const query = `SELECT i.id, i.invoice_date, i.total_amount, i.discount_amount, u.full_name as user_name, c.first_name, c.last_name, SUM(ii.quantity) as item_count, SUM(ii.quantity * ii.price_per_unit) as subtotal, (SUM(ii.quantity * ii.price_per_unit) - SUM(ii.quantity * p.cost_price)) as gross_profit, (((SUM(ii.quantity * ii.price_per_unit) - SUM(ii.quantity * p.cost_price)) / NULLIF(SUM(ii.quantity * ii.price_per_unit), 0)) * 100) as gross_profit_percentage FROM invoices i LEFT JOIN invoice_items ii ON i.id = ii.invoice_id LEFT JOIN products p ON ii.product_id = p.id LEFT JOIN customers c ON i.customer_id = c.id LEFT JOIN users u ON i.user_id = u.id WHERE DATE(i.invoice_date) BETWEEN $1 AND $2 GROUP BY i.id, u.id, c.id ORDER BY i.invoice_date DESC`; const result = await pool.query(query, [startDate, endDate]); res.json(result.rows); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/reports/profit-loss', authenticateToken, async (req, res) => { try { const { startDate, endDate } = req.query; const salesResult = await pool.query("SELECT SUM(total_amount) as total_revenue FROM invoices WHERE DATE(invoice_date) BETWEEN $1 AND $2", [startDate, endDate]); const cogsResult = await pool.query(`SELECT SUM(ii.quantity * p.cost_price) as total_cogs FROM invoice_items ii JOIN invoices i ON ii.invoice_id = i.id JOIN products p ON ii.product_id = p.id WHERE DATE(i.invoice_date) BETWEEN $1 AND $2`, [startDate, endDate]); const expensesResult = await pool.query("SELECT SUM(amount) as total_expenses FROM expenses WHERE DATE(expense_date) BETWEEN $1 AND $2", [startDate, endDate]); const totalRevenue = parseFloat(salesResult.rows[0].total_revenue) || 0; const totalCogs = parseFloat(cogsResult.rows[0].total_cogs) || 0; const totalExpenses = parseFloat(expensesResult.rows[0].total_expenses) || 0; const grossProfit = totalRevenue - totalCogs; const netProfit = grossProfit - totalExpenses; res.json({ totalRevenue, totalCogs, grossProfit, totalExpenses, netProfit }); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/reports/inventory', authenticateToken, async (req, res) => { try { const query = `SELECT id, name, brand, category, quantity_on_hand, cost_price, selling_price, (quantity_on_hand * cost_price) as inventory_value, unit_name FROM products ORDER BY name ASC`; const result = await pool.query(query); res.json(result.rows); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/reports/income-statement', authenticateToken, async (req, res) => { try { const { startDate, endDate } = req.query; const incomeQuery = `SELECT id, invoice_date as date, total_amount as amount, 'ยอดขาย #' || id as description FROM invoices WHERE DATE(invoice_date) BETWEEN $1 AND $2`; const incomeResult = await pool.query(incomeQuery, [startDate, endDate]); const expenseQuery = `SELECT id, expense_date as date, amount, description, category FROM expenses WHERE DATE(expense_date) BETWEEN $1 AND $2`; const expenseResult = await pool.query(expenseQuery, [startDate, endDate]); const totalIncome = incomeResult.rows.reduce((sum, item) => sum + parseFloat(item.amount), 0); const totalExpense = expenseResult.rows.reduce((sum, item) => sum + parseFloat(item.amount), 0); res.json({ income_items: incomeResult.rows, expense_items: expenseResult.rows, summary: { totalIncome, totalExpense, netResult: totalIncome - totalExpense } }); } catch (e) { res.status(500).send(e.message) } });

// --- DASHBOARD API ---
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => { try { const salesToday = await pool.query("SELECT SUM(total_amount) FROM invoices WHERE DATE(invoice_date) = CURRENT_DATE"); const totalSales = await pool.query("SELECT SUM(total_amount) FROM invoices"); const totalInvoices = await pool.query("SELECT COUNT(*) FROM invoices"); const totalCustomers = await pool.query("SELECT COUNT(*) FROM customers"); res.json({ sales_today: parseFloat(salesToday.rows[0].sum) || 0, total_sales: parseFloat(totalSales.rows[0].sum) || 0, total_invoices: parseInt(totalInvoices.rows[0].count) || 0, total_customers: parseInt(totalCustomers.rows[0].count) || 0, }); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/dashboard/sales-over-time', authenticateToken, async (req, res) => { try { const query = `SELECT DATE(invoice_date)::date AS sale_date, SUM(total_amount) AS daily_sales FROM invoices WHERE invoice_date >= CURRENT_DATE - INTERVAL '6 days' GROUP BY DATE(invoice_date) ORDER BY sale_date ASC;`; const r = await pool.query(query); res.json(r.rows); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/dashboard/top-products', authenticateToken, async (req, res) => { try { const query = `SELECT p.name, SUM(ii.quantity) AS total_sold FROM invoice_items ii JOIN products p ON ii.product_id = p.id GROUP BY p.name ORDER BY total_sold DESC LIMIT 5;`; const r = await pool.query(query); res.json(r.rows); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/dashboard/gross-profit-today', authenticateToken, async (req, res) => { try { const query = `SELECT SUM(ii.quantity * (ii.price_per_unit - p.cost_price)) as gross_profit FROM invoice_items ii JOIN invoices i ON ii.invoice_id = i.id JOIN products p ON ii.product_id = p.id WHERE DATE(i.invoice_date) = CURRENT_DATE;`; const result = await pool.query(query); res.json({ gross_profit_today: parseFloat(result.rows[0].gross_profit) || 0 }); } catch (e) { res.status(500).send(e.message) } });
app.get('/api/dashboard/low-stock-products', authenticateToken, async (req, res) => { try { const query = "SELECT id, name, quantity_on_hand, unit_name FROM products WHERE quantity_on_hand < 10 ORDER BY quantity_on_hand ASC"; const result = await pool.query(query); res.json(result.rows); } catch (e) { res.status(500).send(e.message) } });

// --- BACKUP API ---
app.get('/api/backup/database', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Forbidden: Admins only');
    }
    const dbConfig = pool.options;
    const fileName = `backup-ostore-${new Date().toISOString().slice(0, 10)}.sql`;
    const filePath = path.join(__dirname, fileName);
    const pgDumpPath = 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe';
    const command = `\"${pgDumpPath}\" -U ${dbConfig.user} -h ${dbConfig.host} -p ${dbConfig.port} -d ${dbConfig.database} -f \"${filePath}\"`;
    const env = { ...process.env, PGPASSWORD: dbConfig.password, };
    
    exec(command, { env: env }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Backup Exec Error: ${error.message}`);
            return res.status(500).send('Backup failed. Check server logs.');
        }
        if (stderr) {
            console.error(`Backup Stderr: ${stderr}`);
        }
        res.download(filePath, fileName, (err) => {
            if (err) { console.error('Download Error:', err); }
        });
    });
});

// GET: สำหรับทดสอบการเชื่อมต่อฐานข้อมูล
app.get('/api/health-check', async (req, res) => {
    try {
      const client = await pool.connect();
      const time = await client.query('SELECT NOW()'); // ลอง query เวลาจาก DB
      client.release();
      res.json({ 
        status: 'ok', 
        message: 'Successfully connected to the database.',
        db_time: time.rows[0].now 
      });
    } catch (err) {
      console.error('Health Check Error:', err);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to connect to the database.',
        error_message: err.message // ส่งข้อความ error จริงๆ กลับไป
      });
    }
});


// --- 7. สั่งให้เซิร์ฟเวอร์เริ่มทำงาน ---
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});