import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../api/firebase/firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/loading/loading';

export default function ScreenRoom() {
  const { id } = useParams();
  const [screenings, setScreenings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingScreening, setEditingScreening] = useState(null);
  const [editForm, setEditForm] = useState({
    idMovie: '',
    dateTimeStart: '',
    dateTimeEnd: '',
    status: 'active' // Thêm trạng thái mặc định
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Lấy danh sách phim
        const moviesSnapshot = await getDocs(collection(db, "movies"));
        const moviesList = moviesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMovies(moviesList);
        
        // Query để lấy các suất chiếu theo idScreenRoom
        const q = query(collection(db, "screening"), where("idScreenRoom", "==", id));
        const querySnapshot = await getDocs(q);
        
        const screeningList = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            // Format ngày
            let formattedData = { ...data };
            if (data.dateTimeStart && data.dateTimeStart.toDate) {
              formattedData.dateTimeStart = data.dateTimeStart.toDate().toLocaleString("vi-VN");
            }
            if (data.dateTimeEnd && data.dateTimeEnd.toDate) {
              formattedData.dateTimeEnd = data.dateTimeEnd.toDate().toLocaleString("vi-VN");
            }
            
            // Lấy thông tin phim
            let movieInfo = {};
            if (data.idMovie) {
              try {
                const movieDocRef = doc(db, "movies", data.idMovie);
                const movieDoc = await getDoc(movieDocRef);
                if (movieDoc.exists()) {
                  movieInfo = movieDoc.data();
                }
              } catch (movieError) {
                console.error("Lỗi khi lấy thông tin phim:", movieError);
              }
            }
            
            return {
              id: docSnap.id,
              ...formattedData,
              movie: movieInfo,
              originalData: data // Lưu dữ liệu gốc để edit
            };
          })
        );
        
        setScreenings(screeningList);
      } catch (error) {
        console.error("Lỗi lấy suất chiếu:", error);
        setError("Không thể tải danh sách suất chiếu. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleEdit = (screening) => {
    setEditingScreening(screening.id);
    // Chuyển đổi từ timestamp sang datetime-local format
    const formatForInput = (timestamp) => {
      if (!timestamp || !timestamp.toDate) return '';
      const date = timestamp.toDate();
      return date.toISOString().slice(0, 16);
    };
    
    setEditForm({
      idMovie: screening.originalData.idMovie || '',
      dateTimeStart: formatForInput(screening.originalData.dateTimeStart),
      dateTimeEnd: formatForInput(screening.originalData.dateTimeEnd),
      status: screening.originalData.status || 'active' // Lấy trạng thái hiện tại hoặc mặc định
    });
  };

  const handleCancelEdit = () => {
    setEditingScreening(null);
    setEditForm({
      idMovie: '',
      dateTimeStart: '',
      dateTimeEnd: '',
      status: 'active'
    });
  };

  const handleSaveEdit = async (screeningId) => {
    setIsLoading(true);
    try {
      if (!editForm.idMovie || !editForm.dateTimeStart || !editForm.dateTimeEnd) {
        toast.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      // Kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
      if (new Date(editForm.dateTimeEnd) <= new Date(editForm.dateTimeStart)) {
        toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
        return;
      }

      const screeningRef = doc(db, "screening", screeningId);
      await updateDoc(screeningRef, {
        idMovie: editForm.idMovie,
        dateTimeStart: new Date(editForm.dateTimeStart),
        dateTimeEnd: new Date(editForm.dateTimeEnd),
        status: editForm.status // Lưu trạng thái
      });
      setEditingScreening(null);
      toast.success("Cập nhật suất chiếu thành công!");
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi cập nhật suất chiếu:", error);
      toast.error("Cập nhật suất chiếu thất bại!");
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />
  }

  const handleDelete = async (screeningId, movieTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa suất chiếu "${movieTitle}"?`)) {
      try {
        await deleteDoc(doc(db, "screening", screeningId));
        
        // Cập nhật state để xóa khỏi UI
        setScreenings(screenings.filter(screening => screening.id !== screeningId));
        toast.success("Xóa suất chiếu thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa suất chiếu:", error);
        toast.error("Xóa suất chiếu thất bại!");
      }
    }
  };

  // Hàm để lấy trạng thái hiển thị
  const getStatusInfo = (screening) => {
    // Ưu tiên trạng thái thủ công nếu có
    if (screening.originalData?.status) {
      return {
        status: screening.originalData.status === 'active' ? 'Đang hoạt động' : 'Bảo trì',
        className: screening.originalData.status === 'active' ? 'status-active' : 'status-maintenance'
      };
    }
    
    // Nếu không có trạng thái thủ công, kiểm tra theo thời gian (logic cũ)
    const now = new Date();
    const endTime = screening.dateTimeEnd ? new Date(screening.dateTimeEnd.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')) : null;
    const isEnded = endTime && endTime < now;
    
    return {
      status: isEnded ? 'Đã kết thúc' : 'Đang hoạt động',
      className: isEnded ? 'status-ended' : 'status-active'
    };
  };

  return (
    <div className="screen-room-container">
      <ToastContainer />
      <style>{`
        .screen-room-container {
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .screen-room-title {
          text-align: center;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 30px;
          color: #333;
        }

        .loading, .error {
          text-align: center;
          font-size: 1.2rem;
          margin-top: 40px;
          padding: 20px;
        }

        .loading {
          color: #007bff;
        }

        .error {
          color: #dc3545;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
        }

        .screening-table {
          width: 100%;
          border-collapse: collapse;
          background-color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .screening-table th, .screening-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #dee2e6;
          text-align: left;
          vertical-align: middle;
        }

        .screening-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }

        .screening-table tbody tr:hover {
          background-color: #f5f5f5;
        }

        .screening-table tbody tr:last-child td {
          border-bottom: none;
        }

        .no-screenings {
          text-align: center;
          padding: 40px 20px;
          font-style: italic;
          color: #6c757d;
          background-color: #f8f9fa;
          border-radius: 8px;
          margin-top: 20px;
        }

        .movie-title {
          font-weight: 500;
          color: #007bff;
        }

        .movie-info {
          font-size: 0.9rem;
          color: #6c757d;
          margin-top: 4px;
        }

        .screening-status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-active {
          background-color: #d4edda;
          color: #155724;
        }

        .status-ended {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-maintenance {
          background-color: #fff3cd;
          color: #856404;
        }

        .datetime-cell {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-edit {
          background-color: #ffc107;
          color: #212529;
        }

        .btn-edit:hover {
          background-color: #e0a800;
        }

        .btn-delete {
          background-color: #dc3545;
          color: #fff;
        }

        .btn-delete:hover {
          background-color: #c82333;
        }

        .btn-save {
          background-color: #28a745;
          color: #fff;
        }

        .btn-save:hover {
          background-color: #218838;
        }

        .btn-cancel {
          background-color: #6c757d;
          color: #fff;
        }

        .btn-cancel:hover {
          background-color: #5a6268;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .edit-form select, .edit-form input {
          padding: 6px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
          width: 300px;
        }

        .edit-form select:focus, .edit-form input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .edit-actions {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }

        .status-select {
          width: 150px;
          padding: 6px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .status-select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        @media (max-width: 768px) {
          .screen-room-container {
            padding: 10px;
          }
          
          .screening-table {
            font-size: 0.9rem;
          }
          
          .screening-table th, .screening-table td {
            padding: 10px 8px;
          }
          
          .action-buttons {
            flex-direction: column;
            gap: 4px;
          }
          
          .btn {
            font-size: 0.8rem;
            padding: 4px 8px;
          }
        }

        .edit-cell {
          background-color: #f8f9fa;
          border: 2px solid #007bff;
        }
      `}</style>

      <h2 className="screen-room-title">
        Danh Sách Suất Chiếu
      </h2>

       {error ? (
        <div className="error">{error}</div>
      ) : screenings.length === 0 ? (
        <div className="no-screenings">
          Không có suất chiếu nào cho phòng này.
        </div>
      ) : (
        <table className="screening-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Phim</th>
              <th>Bắt Đầu</th>
              <th>Kết Thúc</th>
              <th>Trạng Thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {screenings.map((screening, index) => {
              const statusInfo = getStatusInfo(screening);
              const isEditing = editingScreening === screening.id;
              
              return (
                <tr key={screening.id} className={isEditing ? 'edit-row' : ''}>
                  <td>{index + 1}</td>
                  
                  {/* Phim */}
                  <td className={isEditing ? 'edit-cell' : ''}>
                    {isEditing ? (
                      <div className="edit-form">
                        <select
                          value={editForm.idMovie}
                          onChange={(e) => setEditForm({...editForm, idMovie: e.target.value})}
                        >
                          <option value="">Chọn phim</option>
                          {movies.map(movie => (
                            <option key={movie.id} value={movie.id}>
                              {movie.nameMovie}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      screening.movie?.nameMovie ? (
                        <div>
                          <div className="movie-title">{screening.movie.nameMovie}</div>
                          {screening.movie.timeMovie && (
                            <div className="movie-info">
                              Thời lượng: {screening.movie.timeMovie} phút
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#6c757d', fontStyle: 'italic' }}>
                          Chưa có thông tin phim
                        </span>
                      )
                    )}
                  </td>
                  
                  {/* Thời gian bắt đầu */}
                  <td className={`datetime-cell ${isEditing ? 'edit-cell' : ''}`}>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editForm.dateTimeStart}
                        onChange={(e) => setEditForm({...editForm, dateTimeStart: e.target.value})}
                      />
                    ) : (
                      screening.dateTimeStart || 'N/A'
                    )}
                  </td>
                  
                  {/* Thời gian kết thúc */}
                  <td className={`datetime-cell ${isEditing ? 'edit-cell' : ''}`}>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editForm.dateTimeEnd}
                        onChange={(e) => setEditForm({...editForm, dateTimeEnd: e.target.value})}
                      />
                    ) : (
                      screening.dateTimeEnd || 'N/A'
                    )}
                  </td>
                  
                  {/* Trạng thái */}
                  <td className={isEditing ? 'edit-cell' : ''}>
                    {isEditing ? (
                      <select
                        className="status-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      >
                        <option value="active">Đang hoạt động</option>
                        <option value="maintenance">Bảo trì</option>
                      </select>
                    ) : (
                      <span className={`screening-status ${statusInfo.className}`}>
                        {statusInfo.status}
                      </span>
                    )}
                  </td>
                  
                  {/* Hành động */}
                  <td>
                    {isEditing ? (
                      <div className="edit-actions">
                        <button
                          className="btn btn-save"
                          onClick={() => handleSaveEdit(screening.id)}
                        >
                          Lưu
                        </button>
                        <button
                          className="btn btn-cancel"
                          onClick={handleCancelEdit}
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEdit(screening)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(screening.id, screening.movie?.nameMovie || 'Suất chiếu')}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}