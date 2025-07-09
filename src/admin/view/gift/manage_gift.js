import React, { useState, useEffect } from "react";
import { db } from "../../../api/firebase/firebase";
import { collection, getDocs, query, where, limit, startAfter, orderBy, deleteDoc, doc } from "firebase/firestore";
import Loading from "../../components/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ManageGift() {
  const [gifts, setGifts] = useState([]);
  const [filteredGifts, setFilteredGifts] = useState([]);
  const [filterExpired, setFilterExpired] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [error, setError] = useState(null);
  const giftsPerPage = 20;

  // Fetch gifts với phân trang
  useEffect(() => {
    fetchGifts();
  }, [filterExpired, currentPage]);

  const fetchGifts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Tính toán offset cho phân trang
      const offset = (currentPage - 1) * giftsPerPage;
      
      let q = query(collection(db, "discounts"), orderBy("dateTimeEnd"), limit(giftsPerPage));
      
      // Nếu không phải trang đầu, cần skip các documents trước đó
      if (offset > 0) {
        // Lấy documents để skip
        const skipQuery = query(collection(db, "discounts"), orderBy("dateTimeEnd"), limit(offset));
        const skipSnapshot = await getDocs(skipQuery);
        if (skipSnapshot.docs.length > 0) {
          const lastSkipDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
          q = query(collection(db, "discounts"), orderBy("dateTimeEnd"), startAfter(lastSkipDoc), limit(giftsPerPage));
        }
      }

      // Áp dụng filter nếu có
      if (filterExpired === "expired") {
        const now = new Date();
        q = query(q, where("dateTimeEnd", "<", now), where("stateDiscount", "==", false));
      }

      const querySnapshot = await getDocs(q);
      const giftList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dateTimeStart: data.dateTimeStart instanceof Object ? data.dateTimeStart.toDate() : new Date(data.dateTimeStart),
          dateTimeEnd: data.dateTimeEnd instanceof Object ? data.dateTimeEnd.toDate() : new Date(data.dateTimeEnd)
        };
      });

      // Tính tổng số trang
      const totalCountQuery = query(collection(db, "discounts"));
      const totalCountSnapshot = await getDocs(totalCountQuery);
      const totalCount = totalCountSnapshot.size;
      const calculatedTotalPages = Math.ceil(totalCount / giftsPerPage);

      setGifts(giftList);
      setFilteredGifts(giftList);
      setTotalPages(calculatedTotalPages);
      
    } catch (error) {
      console.error("Lỗi khi lấy gift code:", error);
      toast.error("Không thể tải danh sách gift code. Vui lòng thử lại.");
      setError("Không thể tải danh sách gift code.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilterExpired(e.target.value);
    setCurrentPage(1);
    setShowDetails(null);
    setError(null);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      setShowDetails(null);
    }
  };

  const isExpired = (endDate) => {
    const now = new Date();
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
        
        // Refresh lại trang hiện tại sau khi xóa
        await fetchGifts();
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

  // Tạo array cho pagination buttons
  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    if (totalPages <= maxVisibleButtons) {
      // Nếu tổng số trang ít hơn hoặc bằng maxVisibleButtons
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Nếu tổng số trang nhiều hơn maxVisibleButtons
      const start = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
      const end = Math.min(totalPages, start + maxVisibleButtons - 1);
      
      if (start > 1) {
        buttons.push(1);
        if (start > 2) buttons.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) buttons.push('...');
        buttons.push(totalPages);
      }
    }
    
    return buttons;
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

          /* Pagination Styles */
          .pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
            gap: 10px;
          }

          .pagination-info {
            font-size: 0.9rem;
            color: #666;
            margin-right: 20px;
          }

          .pagination-controls {
            display: flex;
            gap: 5px;
          }

          .pagination-btn {
            padding: 8px 12px;
            border: 1px solid #ddd;
            background-color: #fff;
            color: #007bff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
          }

          .pagination-btn:hover {
            background-color: #f8f9fa;
            border-color: #007bff;
          }

          .pagination-btn.active {
            background-color: #007bff;
            color: #fff;
            border-color: #007bff;
          }

          .pagination-btn:disabled {
            background-color: #f8f9fa;
            color: #6c757d;
            border-color: #ddd;
            cursor: not-allowed;
          }

          .pagination-btn:disabled:hover {
            background-color: #f8f9fa;
            border-color: #ddd;
          }

          .pagination-ellipsis {
            padding: 8px 12px;
            color: #6c757d;
            font-size: 0.9rem;
          }

          @media (max-width: 768px) {
            .pagination-container {
              flex-direction: column;
              gap: 15px;
            }

            .pagination-info {
              margin-right: 0;
            }

            .pagination-controls {
              flex-wrap: wrap;
              justify-content: center;
            }
          }
        `}
      </style>
      <div className="manage-gift-container">
        <ToastContainer />
        <h2 className="manage-gift-title">Quản Lý Gift Code</h2>
        
        <div className="filter-section">
          <select value={filterExpired} onChange={handleFilterChange} className="filter-select">
            <option value="all">Tất cả</option>
            <option value="false">Đã hết hạn</option>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredGifts.map((gift, index) => (
                <tr key={gift.id} onClick={() => handleShowDetails(gift.id)}>
                  <td>{(currentPage - 1) * giftsPerPage + index + 1}</td>
                  <td>{gift.code || "N/A"}</td>
                  <td>{formatDateTime(gift.dateTimeStart)}</td>
                  <td>{formatDateTime(gift.dateTimeEnd)}</td>
                  <td>{isExpired(gift.dateTimeEnd) ? "Hết hạn" : "Hoạt động"}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
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
          
          {!loading && filteredGifts.length === 0 && (
            <div className="no-data">Không có gift code.</div>
          )}
          
          {showDetails && filteredGifts.find((gift) => gift.id === showDetails) && (
            <div className="details">
              <p><strong>ID User:</strong> {filteredGifts.find((gift) => gift.id === showDetails).idUser || "N/A"}</p>
              <p><strong>Ngày Bắt Đầu:</strong> {formatDateTime(filteredGifts.find((gift) => gift.id === showDetails).dateTimeStart)}</p>
              <p><strong>Ngày Kết Thúc:</strong> {formatDateTime(filteredGifts.find((gift) => gift.id === showDetails).dateTimeEnd)}</p>
              <p><strong>Giảm Giá:</strong> {filteredGifts.find((gift) => gift.id === showDetails).priceDiscount || "N/A"} VND</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredGifts.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Trang {currentPage} / {totalPages} (Tổng: {gifts.length} gift code)
            </div>
            
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                « Trước
              </button>
              
              {getPaginationButtons().map((button, index) => (
                button === '...' ? (
                  <span key={index} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={index}
                    className={`pagination-btn ${currentPage === button ? 'active' : ''}`}
                    onClick={() => handlePageChange(button)}
                  >
                    {button}
                  </button>
                )
              ))}
              
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Tiếp »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}