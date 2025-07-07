import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModel from '../../../models/authAdmin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/loading/loading';

export default function ManageAdmin() {
    const [admin, setAdmin] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdmins = async () => {
            setError('');
            setIsLoading(true);
            try {
                if (!AuthModel.isAuthenticated()) {
                    toast.error('Vui lòng đăng nhập để xem danh sách quản trị viên.');
                    navigate('/admin/login');
                    return;
                }

                const response = await fetch('http://localhost:5000/manage_admin', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${AuthModel.getToken()}`,
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setAdmin(data); // Assuming data is an array of admin objects
                } else {
                    setError(data.message || 'Lỗi khi lấy danh sách quản trị viên.');
                    toast.error(data.message || 'Lỗi khi lấy dữ liệu.');
                }
            } catch (err) {
                console.error('Fetch admins error:', err);
                setError('Đã xảy ra lỗi khi tải danh sách quản trị viên.');
                toast.error('Lỗi kết nối server.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdmins();
    }, [navigate]);

    // Placeholder for delete admin (to be implemented)
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa quản trị viên này?')) {
            try {
                const response = await fetch(`http://localhost:5000/manage_admin/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${AuthModel.getToken()}`,
                    },
                });
                if (response.ok) {
                    setAdmin(admin.filter((a) => a.id_admin !== id));
                    toast.success('Xóa quản trị viên thành công!');
                } else {
                    const data = await response.json();
                    toast.error(data.message || 'Xóa quản trị viên thất bại.');
                }
            } catch (err) {
                console.error('Delete admin error:', err);
                toast.error('Lỗi khi xóa quản trị viên.');
            }
        }
    };

    // Placeholder for edit admin (navigate to edit page)
    const handleEdit = (id) => {
        navigate(`/admin/edit_admin/${id}`);
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="manage-admin-container">
            <ToastContainer />
            <h1>Quản Lý Quản Trị Viên</h1>
            {error && <div className="error">{error}</div>}
            {admin.length === 0 && !error ? (
                <p>Không có quản trị viên nào.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên đăng nhập</th>
                            <th>Cấp độ</th>
                            <th>Trạng thái</th>
                            <th>Đăng nhập cuối</th>
                            <th>Đăng xuất cuối</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admin.map((a) => (
                            <tr key={a.id_admin}>
                                <td>{a.id_admin}</td>
                                <td>{a.username}</td>
                                <td>{a.level}</td>
                                <td>{a.state || 'Không xác định'}</td>
                                <td>{a.dateTimeLogin ? new Date(a.dateTimeLogin).toLocaleString() : 'Chưa đăng nhập'}</td>
                                <td>{a.date_logout ? new Date(a.date_logout).toLocaleString() : 'Chưa đăng xuất'}</td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(a.id_admin)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(a.id_admin)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <style>{`
                .manage-admin-container {
                    background: #FFFFFF;
                    border-radius: 10px;
                    max-width: 1200px;
                    margin: 20px auto;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }

                h1 {
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

                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #FFFFFF;
                    border-radius: 5px;
                    overflow: hidden;
                }

                .admin-table th,
                .admin-table td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }

                .admin-table th {
                    background: #002856;
                    color: #FFFFFF;
                    font-weight: bold;
                }

                .admin-table tr:hover {
                    background: #f5f5f5;
                }

                .edit-btn, .delete-btn {
                    padding: 8px 12px;
                    margin-right: 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background 0.3s;
                }

                .edit-btn {
                    background: #002856;
                    color: #FFFFFF;
                }

                .edit-btn:hover {
                    background: #004080;
                }

                .delete-btn {
                    background: #ff4d4d;
                    color: #FFFFFF;
                }

                .delete-btn:hover {
                    background: #cc0000;
                }
            `}</style>
        </div>
    );
}