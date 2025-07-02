import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCmQ28yB0uCBOPa9dKbyWIYpH2gieJ3tWI",
  authDomain: "unicinema-80396.firebaseapp.com",
  projectId: "unicinema-80396",
  storageBucket: "unicinema-80396.firebasestorage.app",
  messagingSenderId: "503641676608",
  appId: "1:503641676608:web:f35437aacdbef9c4c2f8a5",
  measurementId: "G-N8SHR5E70L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function ManageProduct() {
  const [products, setProduct] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setError('');
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'movies'));
        const product = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          };
        });
        setProduct(product);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Đã xảy ra lỗi khi tải danh sách phim.');
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
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
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

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 6px solid #ccc;
          border-top: 6px solid #002856;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
