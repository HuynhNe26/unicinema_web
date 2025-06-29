import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, Timestamp } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmQ28yB0uCBOPa9dKbyWIYpH2gieJ3tWI",
  authDomain: "unicinema-80396.firebaseapp.com",
  projectId: "unicinema-80396",
  storageBucket: "unicinema-80396.firebasestorage.app",
  messagingSenderId: "503641676608",
  appId: "1:503641676608:web:f35437aacdbef9c4c2f8a5",
  measurementId: "G-N8SHR5E70L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function ManageUser() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            setError('');
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const usersData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    // Chuyển đổi timestamp Firebase nếu có
                    if (data.created_at && data.created_at instanceof Timestamp) {
                        data.created_at = data.created_at.toDate();
                    }

                    return {
                        id: doc.id,
                        ...data,
                    };
                });
                setUsers(usersData);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Đã xảy ra lỗi khi tải danh sách người dùng.');
                toast.error('Lỗi kết nối Firestore.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="manage-user-container">
            <ToastContainer />
            <h2>Quản Lý Người Dùng</h2>
            {error && <div className="error">{error}</div>}
            {users.length === 0 && !error ? (
                <p>Không có người dùng nào.</p>
            ) : (
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Đã mua</th>
                            <th>Ngày tạo</th>
                            <th>Ngày hết hạn thành viên</th>
                            <th>Ngày bắt đầu thành viên</th>
                            <th>Email</th>
                            <th>Họ và tên</th>
                            <th>ID Thành viên</th>
                            <th>Số điện thoại</th>
                            <th>Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id}>
                                <td>{index + 1}</td>
                                <td>{user.checkBuy ? 'Có' : 'Không'}</td>
                                <td>{user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</td>
                                <td>{user.dateTimeMemberEnd ? new Date(user.dateTimeMemberEnd).toLocaleString() : 'N/A'}</td>
                                <td>{user.dateTimeMemberStart ? new Date(user.dateTimeMemberStart).toLocaleString() : 'N/A'}</td>
                                <td>{user.email || 'N/A'}</td>
                                <td>{user.fullName || 'N/A'}</td>
                                <td>{user.idMemberShip || 'N/A'}</td>
                                <td>{user.phoneNumberUser || 'N/A'}</td>
                                <td>{user.pointUser || '0'}</td>
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

                .loading {
                    text-align: center;
                    padding: 20px;
                    color: #002856;
                    font-size: 18px;
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
            `}</style>
        </div>
    );
}