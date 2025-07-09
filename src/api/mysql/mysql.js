const express = require('express');
const cors = require('cors');
const api = express();
const port = 5000;
const db = require('../../config/db_mysql');
const jwt = require('jsonwebtoken');
const { messaging } = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');

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
        if (!username || !password || !fullname || !email || !phoneNumber || !birthOfDate || !address || !level || !role) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
        }

        const [check] = await db.query('SELECT username FROM admin WHERE username = ? AND level = ?', [username, level]);
        if (check.length > 0) {
            return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
        } else {
            const state = 'Tài khoản mới';

            const [rows] = await db.query(
                `INSERT INTO admin (username, password, fullname, email, phoneNumber, birthOfDate, address, level, role, state, dateTimeLogin, dateTimeLogout) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
                [username, password, fullname, email, phoneNumber, birthOfDate, address, level, role, state, ""]
            );

            if (rows.affectedRows > 0) {
                return res.status(201).json({ message: "Thêm quản trị viên thành công!" });
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

    const accessKey = 'F8BBA842ECF85'; // Thay bằng access key thực tế
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'; // Thay bằng secret key thực tế
    const partnerCode = 'MOMO';
    const orderInfo = 'Thanh toán vé phim';
    const redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b'; // Deep link của ứng dụng Android
    const ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b'; // URL server để nhận thông báo từ MoMo
    const requestType = 'payWithMethod';
    const amount = req.body.amount || '50000'; // Lấy số tiền từ request hoặc mặc định
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const extraData = '';
    const lang = 'vi';
    const autoCapture = true;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);

    const signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);

    const requestBody = JSON.stringify({
        partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang,
        requestType,
        autoCapture,
        extraData,
        signature
    });

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
        return res.status(200).json({ payUrl: result.data.payUrl, orderId });
    } catch (error) {
        console.error('Error calling MoMo API:', error.message);
        return res.status(500).json({
            statusCode: 500,
            message: 'Lỗi server khi gọi API MoMo'
        });
    }
});

api.get('/check-order-status', async (req, res) => {
    const orderId = req.query.orderId;
    const status = await getOrderStatusFromDB(orderId);
    res.json({ status });
});

async function getOrderStatusFromDB(orderId) {
    try {
        const [rows] = await db.query('SELECT payment_status FROM orders WHERE order_id = ?', [orderId]);
        return rows.length > 0 ? rows[0].payment_status : "UNKNOWN";
    } catch (error) {
        console.error('Error querying order status:', error);
        return "UNKNOWN";
    }
}

api.post('/save-payment-details', async (req, res) => {
    const {
        orderId,
        selectedDeskIds,
        totalAmount,
        movieName,
        screeningDateTime,
        screenRoomName,
        idUser,
        idMethodPayment,
        paymentSuccess
    } = req.body;

    try {
        if (!orderId || !totalAmount || !idUser) {
            return res.status(400).json({ message: "Thiếu thông tin yêu cầu (orderId, totalAmount, idUser)!" });
        }

        const deskIdsJson = JSON.stringify(selectedDeskIds || []);

        const query = `
            INSERT INTO orders (order_id, total_amount, movie_name, screening_datetime, screen_room_name, user_id, payment_method, payment_status, desk_ids, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                total_amount = VALUES(total_amount),
                movie_name = VALUES(movie_name),
                screening_datetime = VALUES(screening_datetime),
                screen_room_name = VALUES(screen_room_name),
                user_id = VALUES(user_id),
                payment_method = VALUES(payment_method),
                payment_status = VALUES(payment_status),
                desk_ids = VALUES(desk_ids),
                updated_at = NOW()
        `;
        const values = [
            orderId,
            totalAmount,
            movieName || 'N/A',
            screeningDateTime || 'N/A',
            screenRoomName || 'N/A',
            idUser,
            idMethodPayment || 'N/A',
            paymentSuccess ? 'SUCCESS' : 'FAILED',
            deskIdsJson
        ];

        const [result] = await db.query(query, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "Lưu thông tin thanh toán thành công!", orderId });
        } else {
            return res.status(500).json({ message: "Lưu thông tin thất bại!" });
        }
    } catch (error) {
        console.error('Lỗi lưu thông tin thanh toán:', error);
        return res.status(500).json({ message: 'Lỗi server khi lưu thông tin thanh toán', error: error.message });
    }
});

api.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

module.exports = api;