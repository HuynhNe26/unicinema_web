import React, { useState, useEffect } from "react";
import { db } from "../../../api/firebase/firebase"; // Đường dẫn đến file firebase.js
import { collection, getDocs, query, where, limit, startAfter, orderBy } from "firebase/firestore";

export default function ManageGift() {
  const [gifts, setGifts] = useState([]);
  const [filteredGifts, setFilteredGifts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [filterExpired, setFilterExpired] = useState("all"); // "all" hoặc "expired"
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Kiểm tra xem còn dữ liệu để tải không
  const [showDetails, setShowDetails] = useState(null); // Lưu ID gift để hiển thị chi tiết
  const giftsPerPage = 5;

  // Lấy danh sách gift code từ Firestore
  useEffect(() => {
    let isMounted = true;

    const fetchGifts = async () => {
      if (!hasMore || loading) return;
      setLoading(true);

      let q = query(collection(db, "discounts"), orderBy("dateTimeEnd"), limit(giftsPerPage));

      if (lastDoc) {
        q = query(collection(db, "discounts"), orderBy("dateTimeEnd"), startAfter(lastDoc), limit(giftsPerPage));
      }

      if (filterExpired === "expired") {
        const now = new Date(); // Thời gian động: 12:28 AM +07, July 07, 2025
        q = query(q, where("dateTimeEnd", "<", now.toISOString()), where("stateDiscount", "==", false));
      }

      try {
        const querySnapshot = await getDocs(q);
        const giftList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched gifts:", giftList); // Debug: Xem dữ liệu được tải
        if (isMounted) {
          setGifts((prev) => {
            const newGifts = lastDoc ? [...prev, ...giftList] : giftList;
            return newGifts;
          });
          setFilteredGifts(lastDoc ? [...filteredGifts, ...giftList] : giftList);
          setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
          setHasMore(giftList.length === giftsPerPage);
        }
      } catch (error) {
        console.error("Lỗi khi lấy gift code:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGifts();

    return () => {
      isMounted = false;
    };
  }, [filterExpired, lastDoc, hasMore]);

  // Xử lý phân trang
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Lọc gift code theo trạng thái hết hạn
  const handleFilterChange = (e) => {
    setFilterExpired(e.target.value);
    setPage(1);
    setGifts([]);
    setLastDoc(null);
    setHasMore(true);
    setShowDetails(null); // Reset chi tiết khi lọc lại
  };

  // Kiểm tra trạng thái hết hạn
  const isExpired = (endDate) => {
    const now = new Date(); // Thời gian động: 12:28 AM +07, July 07, 2025
    return new Date(endDate) < now;
  };

  // Hiển thị chi tiết khi nhấn vào gift code
  const handleShowDetails = (id) => {
    setShowDetails(showDetails === id ? null : id); // Toggle chi tiết
  };

  return (
    <div>
      <style>
        {`
          .manage-gift-container {
            min-height: 100vh;
            padding: 20px;
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
          }

          .manage-gift-title {
            text-align: center;
            font-size: 2.5rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
          }

          .filter-section {
            text-align: right;
            margin-bottom: 20px;
          }

          .filter-select {
            padding: 8px 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            background-color: #fff;
          }

          .filter-select:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
          }

          .gift-table-container {
            overflow-x: auto;
          }

          .gift-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #fff;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }

          .gift-table th,
          .gift-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }

          .gift-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #555;
            text-transform: uppercase;
            font-size: 0.9rem;
          }

          .gift-table td {
            font-size: 1rem;
            color: #333;
            cursor: pointer;
          }

          .gift-table td:hover {
            background-color: #f0f0f0;
          }

          .details {
            margin-top: 10px;
            padding: 10px;
            background-color: #e9ecef;
            border-radius: 4px;
          }

          .loading,
          .no-data {
            text-align: center;
            padding: 20px;
            color: #666;
          }

          .load-more {
            text-align: center;
            margin-top: 20px;
          }

          .load-more-btn {
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          }

          .load-more-btn:hover {
            background-color: #0056b3;
          }
        `}
      </style>
      <div className="manage-gift-container">
        <h2 className="manage-gift-title">Quản Lý Gift Code</h2>
        <div className="filter-section">
          <select value={filterExpired} onChange={handleFilterChange} className="filter-select">
            <option value="all">Tất cả</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>
        <div className="gift-table-container">
          <table className="gift-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã Code</th>
                <th>Ngày Bắt Đầu</th>
                <th>Ngày Kết Thúc</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredGifts.map((gift, index) => (
                <tr key={gift.id} onClick={() => handleShowDetails(gift.id)}>
                  <td>{(page - 1) * giftsPerPage + index + 1}</td>
                  <td>{gift.code}</td>
                  <td>{new Date(gift.dateTimeStart).toLocaleString()}</td>
                  <td>{new Date(gift.dateTimeEnd).toLocaleString()}</td>
                  <td>{isExpired(gift.dateTimeEnd) ? "Hết hạn" : "Hoạt động"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="loading">Đang tải...</div>}
          {!loading && filteredGifts.length === 0 && <div className="no-data">Không có gift code.</div>}
          {showDetails && filteredGifts.find((gift) => gift.id === showDetails) && (
            <div className="details">
              <p><strong>ID User:</strong> {filteredGifts.find((gift) => gift.id === showDetails).idUser}</p>
              <p><strong>Ngày Bắt Đầu:</strong> {new Date(filteredGifts.find((gift) => gift.id === showDetails).dateTimeStart).toLocaleString()}</p>
              <p><strong>Ngày Kết Thúc:</strong> {new Date(filteredGifts.find((gift) => gift.id === showDetails).dateTimeEnd).toLocaleString()}</p>
              <p><strong>Giảm Giá:</strong> {filteredGifts.find((gift) => gift.id === showDetails).priceDiscount} VND</p>
            </div>
          )}
        </div>
        {!loading && filteredGifts.length > 0 && filteredGifts.length % giftsPerPage === 0 && (
          <div className="load-more">
            <button onClick={handleLoadMore} className="load-more-btn">
              Tải thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}