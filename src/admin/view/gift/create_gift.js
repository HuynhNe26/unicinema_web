import React, { useState, useEffect } from "react";
import { db } from "../../../api/firebase/firebase"; // Đường dẫn đến file firebase.js
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

export default function CreateGift() {
  const [email, setEmail] = useState("");
  const [priceDiscount, setPriceDiscount] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [users, setUsers] = useState([]);

  // Lấy danh sách người dùng khi component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map((doc) => ({
        uid: doc.data().uid || doc.id,
        email: doc.data().email,
      }));
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  // Tạo voucher với giá tiền được nhập
  const generateVoucher = async (userId = null) => {
    if (!priceDiscount || isNaN(priceDiscount) || parseFloat(priceDiscount) <= 0) {
      alert("Vui lòng nhập giá tiền giảm hợp lệ!");
      return null;
    }

    const randomCode = `Z${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const now = new Date(); // Dữ liệu động: 11:28 PM +07, July 06, 2025
    const startTime = new Date(now);
    const endTime = new Date(now.setDate(now.getDate() + 30)); // Kết thúc sau 30 ngày
    const stateDiscount = true;

    let targetUserId = userId;

    if (!targetUserId && email) {
      const user = users.find((u) => u.email === email);
      targetUserId = user ? user.uid : null;
      if (!targetUserId) {
        alert("Email không tồn tại!");
        return null;
      }
    }

    const voucherData = {
      code: randomCode,
      dateTimeEnd: endTime.toISOString(),
      dateTimeStart: startTime.toISOString(),
      idUser: targetUserId || "all", // "all" nếu gửi cho tất cả
      priceDiscount: parseFloat(priceDiscount),
      stateDiscount: stateDiscount,
    };

    await setDoc(doc(collection(db, "discounts"), `idDiscount${Date.now()}`), voucherData);
    return voucherData;
  };

  // Gửi cho người dùng cụ thể
  const handleSendToSpecific = async () => {
    if (!email || !priceDiscount) {
      alert("Vui lòng nhập email và giá tiền giảm!");
      return;
    }
    const createdVoucher = await generateVoucher();
    if (createdVoucher) {
      setVoucher(createdVoucher);
      alert("Voucher đã được tạo và lưu cho người dùng cụ thể!");
    }
  };

  // Gửi cho tất cả người dùng
  const handleSendToAll = async () => {
    if (!priceDiscount) {
      alert("Vui lòng nhập giá tiền giảm!");
      return;
    }
    if (users.length === 0) {
      alert("Không có người dùng nào để gửi!");
      return;
    }
    for (const user of users) {
      await generateVoucher(user.uid);
    }
    alert("Voucher đã được gửi cho tất cả người dùng!");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tạo Voucher</h2>
      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email người dùng (tùy chọn)"
          className="p-2 border rounded w-full"
        />
        <input
          type="number"
          value={priceDiscount}
          onChange={(e) => setPriceDiscount(e.target.value)}
          placeholder="Nhập giá tiền giảm (VND)"
          className="p-2 border rounded w-full"
          min="1"
          step="100"
        />
        <div>
          <button
            onClick={handleSendToSpecific}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            disabled={!email || !priceDiscount}
          >
            Gửi cho người dùng cụ thể
          </button>
          <button
            onClick={handleSendToAll}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={users.length === 0 || !priceDiscount}
          >
            Gửi cho tất cả người dùng
          </button>
        </div>
      </div>
      {voucher && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <h3 className="font-semibold">Thông tin Voucher:</h3>
          <p>Code: {voucher.code}</p>
          <p>Ngày bắt đầu: {new Date(voucher.dateTimeStart).toLocaleString()}</p>
          <p>Ngày kết thúc: {new Date(voucher.dateTimeEnd).toLocaleString()}</p>
          <p>ID User: {voucher.idUser}</p>
          <p>Giảm giá: {voucher.priceDiscount} VND</p>
          <p>Trạng thái: {voucher.stateDiscount ? "Hoạt động" : "Hết hiệu lực"}</p>
        </div>
      )}
    </div>
  );
}