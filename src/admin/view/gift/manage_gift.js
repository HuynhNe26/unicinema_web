import React, { useState, useEffect } from "react";
import { db } from "../../../api/firebase/firebase";
import { collection, getDocs, query, where, limit, startAfter, orderBy, deleteDoc, doc } from "firebase/firestore";
import Loading from "../../components/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ManageGift() {
  const [gifts, setGifts] = useState([]);
  const [filteredGifts, setFilteredGifts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [filterExpired, setFilterExpired] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showDetails, setShowDetails] = useState(null);
  const [error, setError] = useState(null);
  const giftsPerPage = 5;

  useEffect(() => {
    let isMounted = true;

    const fetchGifts = async () => {
      if (!hasMore || loading) return;
      setLoading(true);
      setError(null);

      let q = query(collection(db, "discounts"), orderBy("dateTimeEnd"), limit(giftsPerPage));

      if (lastDoc) {
        q = query(collection(db, "discounts"), orderBy("dateTimeEnd"), startAfter(lastDoc), limit(giftsPerPage));
      }

      if (filterExpired === "expired") {
        const now = new Date(); // Thời gian động: 12:33 PM +07, July 07, 2025
        q = query(q, where("dateTimeEnd", "<", now), where("stateDiscount", "==", false));
      }

      try {
        const querySnapshot = await getDocs(q);
        const giftList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Chuyển đổi dateTimeStart và dateTimeEnd thành Date nếu là Timestamp
            dateTimeStart: data.dateTimeStart instanceof Object ? data.dateTimeStart.toDate() : new Date(data.dateTimeStart),
            dateTimeEnd: data.dateTimeEnd instanceof Object ? data.dateTimeEnd.toDate() : new Date(data.dateTimeEnd)
          };
        });
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
        toast.error("Không thể tải danh sách gift code. Vui lòng thử lại.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGifts();

    return () => {
      isMounted = false;
    };
  }, [filterExpired, lastDoc, hasMore]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleFilterChange = (e) => {
    setFilterExpired(e.target.value);
    setPage(1);
    setGifts([]);
    setLastDoc(null);
    setHasMore(true);
    setShowDetails(null);
    setError(null);
  };

  const isExpired = (endDate) => {
    const now = new Date(); // Thời gian động: 12:33 PM +07, July 07, 2025
    return new Date(endDate) < now;
  };

  const handleShowDetails = (id) => {
    setShowDetails(showDetails === id ? null : id);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa gift code ${id}?`)) {
      try {
        setLoading(true);
        setError(null);
        await deleteDoc(doc(db, "discounts", id));
        setGifts(gifts.filter(gift => gift.id !== id));
        setFilteredGifts(filteredGifts.filter(gift => gift.id !== id));
        setShowDetails(null);
        toast.success("Xóa gift code thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa gift code:", error);
        toast.error("Xóa gift code thất bại! Lỗi: " + error.message);
      } finally {
        setLoading(false);
      }
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
      <div className="manage-gift-container">
        <h2 className="manage-gift-title">Quản Lý Gift Code</h2>
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        <div style={{ textAlign: "center" }}>
          <button
            className="load-more-btn"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>
        {`
          .manage-gift-container {
            min-height: 100vh;
            padding: 20px;
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
          }

          .gift-table tr:hover {
            background-color: #f0f0f0;
          }

          .details {
            margin-top: 10px;
            padding: 10px;
            background-color: #e9ecef;
            border-radius: 4px;
          }

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

          .delete-btn {
            padding: 8px 12px;
            background-color: #dc3545;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
          }

          .delete-btn:hover {
            background-color: #c82333;
          }
        `}
      </style>
      <div className="manage-gift-container">
        <ToastContainer />
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
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredGifts.map((gift, index) => (
                <tr key={gift.id} onClick={() => handleShowDetails(gift.id)}>
                  <td>{(page - 1) * giftsPerPage + index + 1}</td>
                  <td>{gift.code || "N/A"}</td>
                  <td>{formatDateTime(gift.dateTimeStart)}</td>
                  <td>{formatDateTime(gift.dateTimeEnd)}</td>
                  <td>{isExpired(gift.dateTimeEnd) ? "Hết hạn" : "Hoạt động"}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn click vào hàng kích hoạt showDetails
                        handleDelete(gift.id);
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredGifts.length === 0 && <div className="no-data">Không có gift code.</div>}
          {showDetails && filteredGifts.find((gift) => gift.id === showDetails) && (
            <div className="details">
              <p><strong>ID User:</strong> {filteredGifts.find((gift) => gift.id === showDetails).idUser || "N/A"}</p>
              <p><strong>Ngày Bắt Đầu:</strong> {formatDateTime(filteredGifts.find((gift) => gift.id === showDetails).dateTimeStart)}</p>
              <p><strong>Ngày Kết Thúc:</strong> {formatDateTime(filteredGifts.find((gift) => gift.id === showDetails).dateTimeEnd)}</p>
              <p><strong>Giảm Giá:</strong> {filteredGifts.find((gift) => gift.id === showDetails).priceDiscount || "N/A"} VND</p>
            </div>
          )}
        </div>
        {!loading && filteredGifts.length > 0 && filteredGifts.length % giftsPerPage === 0 && hasMore && (
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