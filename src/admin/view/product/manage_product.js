import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../api/firebase/firebase';
import Loading from '../../components/loading/loading';

export default function ManageProduct() {
  const [products, setProducts] = useState([]); // Sửa lỗi chính tả setProduct -> setProducts
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setError('');
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'movies'));
        const products = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          };
        });
        setProducts(products); // Sử dụng setProducts thay vì setProduct
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Đã xảy ra lỗi khi tải danh sách phim.');
        toast.error('Lỗi kết nối Firestore.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  const handleDetails = (id) => {
    navigate(`/admin/product_details/${id}`);
  };

  if (loading) {
    return <Loading />; // Sử dụng component Loading thay vì div tùy chỉnh
  }

  return (
    <div className="manage-user-container">
      <ToastContainer />
      <h2>Quản Lý phim</h2>
      {error && <div className="error">{error}</div>}
      {products.length === 0 && !error ? (
        <p>Không có phim nào.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên phim</th>
              <th>Tác giả</th>
              <th>Thời lượng</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>{product.nameMovie || 'N/A'}</td>
                <td>{product.actor || 'N/A'}</td>
                <td>{product.timeMovie || 'N/A'}</td>
                <td>
                  <button onClick={() => handleDetails(product.id)}>
                    Chi tiết phim
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .manage-user-container {
          background: #FFFFFF;
          border-radius: 10px;
          max-width: 1200px;
          margin: 20px auto;
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

        .user-table {
          width: 100%;
          border-collapse: collapse;
          background: #FFFFFF;
          border-radius: 5px;
          overflow: hidden;
        }

        .user-table th,
        .user-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .user-table th {
          background: #002856;
          color: #FFFFFF;
          font-weight: bold;
        }

        .user-table tr:hover {
          background: #f5f5f5;
        }

        /* Xóa style không cần thiết cho loading-container và spinner */
      `}</style>
    </div>
  );
}