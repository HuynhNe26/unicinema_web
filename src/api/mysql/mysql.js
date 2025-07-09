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

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Thiếu token xác thực' });
    }

    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, 'unicinema');
        req.user = decoded; // Lưu payload vào req.user
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

// Login endpoint
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
        console.error("Login error:", error.message);
        return res.status(500).json({ error: "Lỗi đăng nhập!" });
    }
});

// Logout endpoint
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
        console.error('Logout error:', error.message);
        return res.status(500).json({ message: 'Lỗi server khi đăng xuất' });
    }
});

// Get all admins
api.get('/manage_admin', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM admin');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching admins:', error.message);
        console.error('Lỗi lấy dữ liệu admin', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách quản trị viên' });
    }
});

// Create a comment
api.post('/comments', verifyToken, async (req, res) => {
    try {
        const { idMovie, id_user, comment, rating, dateTimeComment } = req.body;

        if (!idMovie || !id_user || !comment || !rating || !dateTimeComment) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 5' });
        }

        const [result] = await db.query(
            'INSERT INTO comment (idMovie, id_user, comment, rating, dateTimeComment) VALUES (?, ?, ?, ?, ?)',
            [idMovie, id_user, comment, rating, dateTimeComment]
        );

        res.status(201).json({
            message: 'Bình luận được tạo thành công',
            id_comment: result.insertId
        });
    } catch (error) {
        console.error('Error creating comment:', error.message);
        res.status(500).json({ message: 'Lỗi server khi tạo bình luận' });
    }
});

// Get comments by movie ID
api.get('/comments/movie/:idMovie', async (req, res) => {
    try {
        const { idMovie } = req.params;
        const [rows] = await db.query(
            'SELECT * FROM comment WHERE idMovie = ?',
            [idMovie]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching comments by movie:', error.message);
        res.status(500).json({ message: 'Lỗi server khi lấy bình luận theo phim' });
    }
});

// Update a comment
api.put('/comments/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { idMovie, id_user, comment, rating, dateTimeComment } = req.body;

        if (!idMovie || !id_user || !comment || !rating || !dateTimeComment) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 5' });
        }

        // Check if comment belongs to the user
        const [commentRows] = await db.query(
            'SELECT id_user FROM comment WHERE id_comment = ?',
            [id]
        );
        if (commentRows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bình luận với ID này' });
        }
        if (commentRows[0].id_user !== req.user.id_admin && req.user.level !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền sửa bình luận này' });
        }

        const [result] = await db.query(
            'UPDATE comment SET idMovie = ?, id_user = ?, comment = ?, rating = ?, dateTimeComment = ? WHERE id_comment = ?',
            [idMovie, id_user, comment, rating, dateTimeComment, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bình luận với ID này' });
        }

        res.status(200).json({ message: 'Cập nhật bình luận thành công' });
    } catch (error) {
        console.error('Error updating comment:', error.message);
        res.status(500).json({ message: 'Lỗi server khi cập nhật bình luận' });
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

const orders = {};

api.post('/payment/:id', async (req, res) => {
    const axios = require('axios');
    const crypto = require('crypto');

    const accessKey = 'F8BBA842ECF85'; // Thay bằng access key thực tế
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'; // Thay bằng secret key thực tế
    const partnerCode = 'MOMO';
    const orderInfo = 'Thanh toán vé phim';

    const redirectUrl = 'unicinema://payment-result'; // Deep link của ứng dụng Android
    const ipnUrl = 'unicinema://payment-result'; // URL server để nhận thông báo từ MoMo
    const requestType = 'captureWallet'; 

    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const user = req.params.id; // Lấy giá trị id từ req.params
    const amount = req.body.amount; // Lấy giá trị amount từ req.body
    const extraData = req.body.extraData;
    const lang = 'vi';
    const autoCapture = true;
    const desk = req.body.idDesk || [];
    const movie = req.body.movie;
    const screenRoom = req.body.screenRoom;
    const dateTime = req.body.dateTime;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);

    const signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);

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

    console.log(orderId,
            amount,
            user,
            desk,
            movie,
        screenRoom,
    dateTime)

    try {
        const result = await axios(options);

        orders[orderId] = {
            status: 'SUCCESS',
            user,
            amount,
            desk,
            movie,
            screenRoom,
            dateTime
        };

        // Trả về payUrl từ response của MoMo
        return res.status(200).json({
            payUrl: result.data.payUrl,
            orderId,
            amount,
            user,
            desk,
            movie,
            screenRoom,
            dateTime
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

    console.log("IPN từ MoMo:", data);

    res.status(200).send('IPN received');
});


api.get('/payment/check-order-status', (req, res) => {
    const { orderId } = req.query;
    if (!orderId || !orders[orderId]) {
        return res.status(404).json({
            statusCode: 404,
            message: 'Không tìm thấy đơn hàng'
        });
    }

    const order = orders[orderId];
    return res.status(200).json({
        statusCode: 200,
        status: order.status,
        user: order.user,
        amount: order.amount,
        desk: order.desk,
        movie: order.movie,
        screenRoom: order.screenRoom,
        dateTime: order.dateTime
    });
});



api.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = api;