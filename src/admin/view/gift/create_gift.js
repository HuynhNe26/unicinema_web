import React, { useState, useEffect } from "react";
import { db } from "../../../api/firebase/firebase";
import { collection, getDocs, setDoc, doc, Timestamp } from "firebase/firestore";
import Loading from "../../components/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateGift() {
  const [email, setEmail] = useState("");
  const [priceDiscount, setPriceDiscount] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách người dùng khi component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map((doc) => ({
          uid: doc.data().uid || doc.id,
          email: doc.data().email || "N/A",
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Tạo voucher với giá tiền được nhập
  const generateVoucher = async (userId = null) => {
    if (!priceDiscount || isNaN(priceDiscount) || parseFloat(priceDiscount) <= 0) {
      toast.error("Vui lòng nhập giá tiền giảm hợp lệ!");
      return null;
    }

    const randomCode = `Z${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const now = new Date(); // Dữ liệu động: 12:35 PM +07, July 07, 2025
    const startTime = new Date(now);
    const endTime = new Date(now.setDate(now.getDate() + 30)); // Kết thúc sau 30 ngày
    const stateDiscount = true;

    let targetUserId = userId;

    if (!targetUserId && email) {
      const user = users.find((u) => u.email === email);
      targetUserId = user ? user.uid : null;
      if (!targetUserId) {
        toast.error("Email không tồn tại!");
        return null;
      }
    }

    const voucherData = {
      code: randomCode,
      dateTimeEnd: Timestamp.fromDate(endTime),
      dateTimeStart: Timestamp.fromDate(startTime),
      idUser: targetUserId || "all",
      priceDiscount: parseFloat(priceDiscount),
      stateDiscount: stateDiscount,
    };

    try {
      const docId = `idDiscount${Date.now()}_${randomCode}`; // Đảm bảo ID duy nhất
      await setDoc(doc(db, "discounts", docId), voucherData);
      console.log("Created voucher:", { ...voucherData, docId }); // Debug: Xem voucher được tạo
      return {
        ...voucherData,
        dateTimeStart: startTime, // Giữ dạng Date để hiển thị
        dateTimeEnd: endTime,
      };
    } catch (error) {
      console.error("Lỗi khi tạo voucher:", error);
      setError("Không thể tạo voucher. Vui lòng thử lại.");
      return null;
    }
  };

  // Gửi cho người dùng cụ thể
  const handleSendToSpecific = async () => {
    if (!email || !priceDiscount) {
      toast.error("Vui lòng nhập email và giá tiền giảm!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const createdVoucher = await generateVoucher();
      if (createdVoucher) {
        setVoucher(createdVoucher);
        toast.success("Voucher đã được tạo và lưu cho người dùng cụ thể!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi voucher cho người dùng cụ thể:", error);
      toast.error("Không thể gửi voucher. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Gửi cho tất cả người dùng
  const handleSendToAll = async () => {
    if (!priceDiscount) {
      toast.error("Vui lòng nhập giá tiền giảm!");
      return;
    }
    if (users.length === 0) {
      setError("Không có người dùng nào để gửi!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const voucherPromises = users.map((user) => generateVoucher(user.uid));
      const results = await Promise.all(voucherPromises);
      const failedVouchers = results.filter((result) => !result);
      if (failedVouchers.length > 0) {
        setError(`Có ${failedVouchers.length} voucher không tạo được. Vui lòng kiểm tra console.`);
      } else {
        toast.success("Voucher đã được gửi cho tất cả người dùng!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi voucher cho tất cả người dùng:", error);
      toast.error("Không thể gửi voucher cho tất cả người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date || isNaN(new Date(date))) return "N/A";
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4">
        <ToastContainer style={{zIndex: '100'}} />
        <h2 className="text-xl font-bold mb-4">Tạo Gift Code</h2>
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        <div style={{ textAlign: "center" }}>
          <button
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <style>
        {`
          .p-4 {
            min-height: 100vh;
            font-family: Arial, sans-serif;
          }

          .text-xl {
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
          }

          .space-y-4 > * + * {
            margin-top: 1rem;
          }

          .p-2 {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 1rem;
            width: 100%;
            box-sizing: border-box;
          }

          .border {
            border: 1px solid #ccc;
          }

          .rounded {
            border-radius: 4px;
          }

          .w-full {
            width: 100%;
          }

          .bg-blue-500 {
            background-color: #007bff;
            color: #fff;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          }

          .bg-blue-500:hover:not(:disabled) {
            background-color: #0056b3;
          }

          .bg-green-500 {
            background-color: #28a745;
            color: #fff;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          }

          .bg-green-500:hover:not(:disabled) {
            background-color: #218838;
          }

          .mr-2 {
            margin-right: 8px;
          }

          .bg-gray-100 {
            background-color: #e9ecef;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-top: 16px;
          }

          .font-semibold {
            font-weight: 600;
          }
        `}
      </style>
      <h2 className="text-xl font-bold mb-4">Tạo Gift Code</h2>
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
            disabled={!email || !priceDiscount || loading}
          >
            Gửi cho người dùng cụ thể
          </button>
          <br />
          <br />
          <button
            onClick={handleSendToAll}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={users.length === 0 || !priceDiscount || loading}
          >
            Gửi cho tất cả người dùng
          </button>
        </div>
      </div>
      {voucher && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <h3 className="font-semibold">Thông tin Voucher:</h3>
          <p>Code: {voucher.code || "N/A"}</p>
          <p>Ngày bắt đầu: {formatDateTime(voucher.dateTimeStart)}</p>
          <p>Ngày kết thúc: {formatDateTime(voucher.dateTimeEnd)}</p>
          <p>ID User: {voucher.idUser || "N/A"}</p>
          <p>Giảm giá: {voucher.priceDiscount || "N/A"} VND</p>
          <p>Trạng thái: {voucher.stateDiscount ? "Hoạt động" : "Hết hiệu lực"}</p>
        </div>
      )}
    </div>
  );
}