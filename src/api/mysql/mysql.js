const express = require('express');
const cors = require('cors');
const api = express();
const port = 5000;
const db = require('../../config/db_mysql');
const jwt = require('jsonwebtoken');

api.use(cors());
api.use(express.json());

api.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username) {
            return res.status(400).json({ message: "Vui lòng nhập tên đăng nhập!" });
        }
        if (!password) {
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu!" });
        }

        // Select id_admin and level along with username and password
        const [rows] = await db.query(
            "SELECT id_admin, username, password, level FROM admin WHERE username = ? AND password = ?",
            [username, password]
        );

        if (rows.length > 0) {
            const payload = {
                id_admin: rows[0].id_admin,
                username: rows[0].username,
                level: rows[0].level
            };

            const id = payload.id_admin;

            await db.query('UPDATE admin SET dateTimeLogin = NOW(), state = "Đang hoạt động" WHERE id_admin = ?', [id]);

            const token = jwt.sign(payload, 'unicinema', { expiresIn: '6h' });

            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                token
            });
        } else {
            return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Lỗi đăng nhập!" });
    }
});

api.put('/logout-admin/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('UPDATE admin SET dateTimeLogout = NOW(), state = "Đã đăng xuất" WHERE id_admin = ?', [id]);

        if (rows.affectedRows > 0) {
            return res.status(200).json({
                message: 'Đăng xuất thành công'
            });
        } else {
            return res.status(404).json({ message: 'Không tìm thấy admin với ID này' });
        }
    } catch (error) {
        console.error('Lỗi truy vấn database:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
});

api.get('/manage_admin', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM admin');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Lỗi lấy dữ liệu admin', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách quản trị viên' });
    }
});

api.post("/new_admin", async (req, res) => {
    const { username, password, fullname, email, phoneNumber, birthOfDate, address, level, role } = req.body;

    try {
        // Kiểm tra đầy đủ thông tin
        if (!username || !password || !fullname || !email || !phoneNumber || !birthOfDate || !address || !level || !role) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
        }

        // Kiểm tra trùng lặp username
        const [check] = await db.query('SELECT username FROM admin WHERE username = ? AND level = ?', [username, level]);
        if (check.length > 0) {
            return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
        } else {
            const state = 'Tài khoản mới';

            // Thêm quản trị viên
            const [rows] = await db.query(
                `INSERT INTO admin (username, password, fullname, email, phoneNumber, birthOfDate, address, level, role, state, dateTimeLogin, dateTimeLogout) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
                [username, password, fullname, email, phoneNumber, birthOfDate, address, level, role, state, ""]
            );

            if (rows.affectedRows > 0) {
                return res.status(201).json({ message: "Thêm quản trị viên thành công!" }); // 201 là mã cho tạo mới
            } else {
                return res.status(500).json({ message: "Thêm quản trị viên thất bại, không có hàng bị ảnh hưởng." });
            }
        }
    } catch (error) {
        console.error('Lỗi thêm admin:', error);
        res.status(500).json({ message: 'Lỗi server khi thêm admin', error: error.message });
    }
});

api.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

module.exports = api;