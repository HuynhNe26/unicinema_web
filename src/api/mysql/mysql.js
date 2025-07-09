const express = require('express');
const cors = require('cors');
const api = express();
const port = 5000;
const db = require('../../config/db_mysql');
const jwt = require('jsonwebtoken');
const { messaging } = require('firebase-admin');

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

api.post('/payment', async (req, res) => {
    const axios = require('axios');
    const crypto = require('crypto');

    // Thông tin cấu hình MoMo
    const accessKey = 'F8BBA842ECF85'; // Thay bằng access key thực tế
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'; // Thay bằng secret key thực tế
    const partnerCode = 'MOMO';
    const orderInfo = 'Thanh toán vé phim';
    const redirectUrl = `unicinema://payment-result`; // Deep link của ứng dụng Android
    const ipnUrl = `unicinema://payment-result`; // URL server để nhận thông báo từ MoMo
    const requestType = 'payWithMethod'; 
    const amount = req.body.amount || '50000'; // Lấy số tiền từ request hoặc mặc định
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const extraData = ''; // Có thể thêm dữ liệu bổ sung nếu cần
    const lang = 'vi';
    const autoCapture = true;
    const user = '';

    // Tạo raw signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);

    // Tạo chữ ký HMAC SHA256
    const signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);

    // JSON gửi đến MoMo
    const requestBody = JSON.stringify({
        partnerCode : partnerCode,
        partnerName : "Test",
        storeId : "MomoTestStore",
        requestId : requestId,
        amount : amount,
        orderId : orderId,
        orderInfo : orderInfo,
        redirectUrl : redirectUrl,
        ipnUrl : ipnUrl,
        lang : lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData : extraData,
        signature : signature,
        user: user,
    });

    // Gọi API MoMo
    const options = {
        method: 'POST',
        url: 'https://test-payment.momo.vn/v2/gateway/api/create',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        },
        data: requestBody
    };

    try {
        const result = await axios(options);
        // Trả về payUrl từ response của MoMo
        return res.status(200).json({
            payUrl: result.data.payUrl,
            orderId,
            amount // ← thêm dòng này
        });

    } catch (error) {
        console.error('Error calling MoMo API:', error.message);
        return res.status(500).json({
            statusCode: 500,
            message: 'Lỗi server khi gọi API MoMo'
        });
    }
});

api.post('/payment/ipn', (req, res) => {
    const data = req.body;

    // TODO: Xác minh chữ ký MoMo để tránh giả mạo (sử dụng secretKey)
    // Sau đó, cập nhật trạng thái đơn hàng trong DB

    console.log("IPN từ MoMo:", data);

    // Giả sử xử lý xong
    res.status(200).send('IPN received');
});


api.get('/payment/check-order-status', async (req, res) => {
    const orderId = req.query.orderId;
    // Kiểm tra order trong DB và trả về status
    res.json({ status: "SUCCESS", orderId }); // hoặc FAILED, PENDING...
});

api.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

module.exports = api;