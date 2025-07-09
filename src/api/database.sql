CREATE TABLE admin (
    id_admin INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE,
    phoneNumber VARCHAR(15) NOT NULL, 
    birthOfDate DATE NOT NULL,
    address VARCHAR(255) NOT NULL,
    level INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    dateTimeLogin DATETIME, 
    dateTimeLogout DATETIME,
    fullname VARCHAR(200) NOT NULL
);

INSERT INTO admin (id_admin, username, password, email, phoneNumber, birthOfDate, address, level, role, state, dateTimeLogin, dateTimeLogout, fullname) VALUES 
(1, 'hoanghuynh', '1234', 'hoanghuynh@gmail.com', '0937569205', '2005-08-26', '1322/768, ấp Ông Hường, xã Thiện Tân, huyện Vĩnh Cửu, tỉnh Đồng Nai', 1, 'Lập trình viên', 'Tài khoản mới', '2025-06-28 00:00:00', '2025-06-29 00:00:00', 'Nguyễn Hoàng Huynh'),
(2, 'baouyen', '1234', 'baouyen@gmail.com', '0123456789', '2005-09-04', 'ấp 5, xã Thạnh Phú, huyện Vĩnh Cửu, tỉnh Đồng Nai', 1, 'Lập trình viên', 'Tài khoản mới', '2025-06-28 00:00:00', '2025-06-29 00:00:00', 'Lê Phạm Bảo Uyên'),
(3, 'huukien', '1234', 'huukien@gmail.com', '0123456789', '2005-06-01', 'quận Phú Nhuận, thành phố Hồ Chí Minh', 1, 'Lập trình viên', 'Tài khoản mới', '2025-06-28 00:00:00', '2025-06-29 00:00:00', 'Phạm Hữu Kiên'),
(4, 'minhvu', '1234', 'minhvu@gmail.com', '0123456789', '2005-09-04', 'quận Phú Nhuận, thành phố Hồ Chí Minh', 1, 'Lập trình viên', 'Tài khoản mới', '2025-06-28 00:00:00', '2025-06-29 00:00:00', 'Phùng Minh Vũ'),
(5, 'anhkiet', '1234', 'anhkiet@gmail.com', '0123456789', '2005-09-04', 'quận 7, thành phố Hồ Chí Minh', 1, 'Lập trình viên', 'Tài khoản mới', '2025-06-28 00:00:00', '2025-06-29 00:00:00', 'Trần Diệp Anh Kiệt');

CREATE TABLE comment (
    id_comment INT PRIMARY KEY AUTO_INCREMENT,
    idMovie VARCHAR(100) NOT NULL,
    id_user VARCHAR(100) NOT NULL,
    comment TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    dateTimeComment DATETIME NOT NULL
);

INSERT INTO comment (id_comment, idMovie, id_user, comment, rating, dateTimeComment) VALUES
(1, 'idMovie0000000000001', 'A3PeXDsUSJcKqQvkuxz1MXjwQRg1', 'Phim như con cặc', '5', '2025-07-05 20:00:00')