import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModel from '../../../models/authAdmin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NewAdmin() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
        birthOfDate: '',
        address: '',
        level: '',
        role: '',
        state: '',
        dateTimeLogin: null,
        dateTimeLogout: null,
        fullname: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!AuthModel.isAuthenticated()) {
                toast.error('Vui lòng đăng nhập để thêm quản trị viên.');
                navigate('/admin/login');
                return;
            }

            const payload = {
                ...formData,
                level: parseInt(formData.level) || 1, // Default to 1 if invalid
                dateTimeLogin: null, // Let backend set current time or null
                dateTimeLogout: null,
            };

            const response = await fetch('http://localhost:5000/new_admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthModel.getToken()}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Thêm quản trị viên thành công!');
                navigate('/admin/manage_admin'); // Redirect to manage admin page
            } else {
                setError(data.message || 'Thêm quản trị viên thất bại.');
                toast.error(data.message || 'Lỗi khi thêm quản trị viên.');
            }
        } catch (err) {
            console.error('Add admin error:', err);
            setError('Đã xảy ra lỗi khi kết nối server.');
            toast.error('Lỗi kết nối server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-admin-container">
            <ToastContainer />
            <h2>Thêm Quản Trị Viên Mới</h2>
            {error && <div className="error">{error}</div>}
            {loading && <div className="loading">Đang xử lý...</div>}
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Tên đăng nhập:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Họ và tên:</label>
                    <input
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Số điện thoại:</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Ngày sinh:</label>
                    <input
                        type="date"
                        name="birthOfDate"
                        value={formData.birthOfDate}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Địa chỉ:</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Cấp độ:</label>
                    <input
                        type="number"
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        min="1"
                        max="3"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Vai trò:</label>
                    <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Trạng thái:</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Đang thêm...' : 'Thêm quản trị viên'}
                </button>
            </form>

            <style>{`
                .new-admin-container {
                    background: #FFFFFF;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    max-width: 700px;
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
                    padding: 10px;
                    color: #002856;
                    font-size: 16px;
                }

                .admin-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-group label {
                    margin-bottom: 5px;
                    color: #002856;
                    font-weight: 500;
                }

                .form-group input {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 14px;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #002856;
                    box-shadow: 0 0 5px rgba(0, 40, 86, 0.3);
                }

                .submit-btn {
                    padding: 10px;
                    background: #002856;
                    color: #FFFFFF;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background 0.3s;
                }

                .submit-btn:hover:not(:disabled) {
                    background: #004080;
                }

                .submit-btn:disabled {
                    background: #cccccc;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}