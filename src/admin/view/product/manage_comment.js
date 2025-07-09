import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../api/firebase/firebase';
import Loading from '../../components/loading/loading';

export default function ManageComment() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      setError('');
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'movies'));
        const movieList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(movieList);
      } catch (err) {
        console.error('Error fetching movies:', err);
        toast.error('Đã xảy ra lỗi khi tải danh sách phim.');
        setError('Lỗi tải danh sách phim');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    if (selectedMovie) {
      fetchComments();
    }
  }, [selectedMovie]);

  const fetchComments = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/comments/${selectedMovie}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Lỗi khi tải comment');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      toast.error('Đã xảy ra lỗi khi tải danh sách comment.');
      setError('Lỗi tải comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (id_comment) => {
    if (window.confirm('Bạn có chắc muốn xóa comment này?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/comments/${id_comment}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Lỗi khi xóa comment');
        }
        toast.success('Xóa comment thành công.');
        fetchComments();
      } catch (err) {
        console.error('Error deleting comment:', err);
        toast.error('Đã xảy ra lỗi khi xóa comment.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="manage-comment-container">
      <ToastContainer />
      <h2>Quản Lý Comment</h2>
      {error && <div className="error">{error}</div>}
      <div className="comment-filter">
        <select
          value={selectedMovie}
          onChange={(e) => setSelectedMovie(e.target.value)}
        >
          <option value="">Chọn phim</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.nameMovie || movie.title || 'N/A'}
            </option>
          ))}
        </select>
      </div>
      {comments.length === 0 && !error ? (
        <p>Không có comment nào cho phim này.</p>
      ) : (
        <table className="comment-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>ID User</th>
              <th>Nội dung Comment</th>
              <th>Thời gian</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment, index) => (
              <tr key={comment.id_comment}>
                <td>{index + 1}</td>
                <td>{comment.id_user}</td>
                <td>{comment.comment}</td>
                <td>{new Date(comment.dateTimeComment).toLocaleString('vi-VN')}</td>
                <td>
                  <button onClick={() => handleDeleteComment(comment.id_comment)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .manage-comment-container {
          background: #FFFFFF;
          border-radius: 10px;
          max-width: 1200px;
          margin: 20px auto;
          padding: 20px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        h2 {
          color: #002856;
          margin-bottom: 20px;
          text-align: center;
        }

        .error {
          color: red;
          text-align: center;
          margin-bottom: 20px;
        }

        .comment-filter {
          margin-bottom: 20px;
        }

        .comment-filter select {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          width: 100%;
          max-width: 300px;
        }

        .comment-table {
          width: 100%;
          border-collapse: collapse;
          background: #FFFFFF;
          border-radius: 5px;
          overflow: hidden;
        }

        .comment-table th,
        .comment-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .comment-table th {
          background: #002856;
          color: #FFFFFF;
          font-weight: bold;
        }

        .comment-table tr:hover {
          background: #f5f5f5;
        }

        .comment-table button {
          background: #dc3545;
          color: #FFFFFF;
          border: none;
          border-radius: 5px;
          padding: 5px 10px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
