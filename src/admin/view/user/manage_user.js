import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../../../api/firebase/firebase';
import Loading from '../../components/loading/loading';

export default function ManageUser() {
    const [users, setUsers] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setError('');
            setLoading(true);
            try {
                // Lấy dữ liệu từ collection 'users'
                const usersQuerySnapshot = await getDocs(collection(db, 'users'));
                const usersData = usersQuerySnapshot.docs.map(doc => {
                    const data = doc.data();
                    if (data.dateEnd && data.dateEnd instanceof Timestamp) {
                        data.dateEnd = data.dateEnd.toDate();
                    }
                    if (data.dateStart && data.dateStart instanceof Timestamp) {
                        data.dateStart = data.dateStart.toDate();
                    }
                    return {
                        id: doc.id,
                        ...data,
                    };
                });
                setUsers(usersData);

                // Lấy dữ liệu từ collection 'memberShip'
                const membershipsQuerySnapshot = await getDocs(collection(db, 'memberShip'));
                const membershipsData = membershipsQuerySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                    };
                });
                setMemberships(membershipsData);

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Đã xảy ra lỗi khi tải danh sách.');
                toast.error('Lỗi kết nối Firestore.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <Loading />; // Sử dụng component Loading thay vì div
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
                            <th>Họ và tên</th>
                            <th>Ngày hết hạn thành viên</th>
                            <th>Ngày bắt đầu thành viên</th>
                            <th>Email</th>
                            <th>Địa chỉ</th>
                            <th>Hạng Thành Viên</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => {
                            // Tìm membership có id khớp với idMemberShip của user
                            const matchingMembership = memberships.find(m => m.id === user.idMemberShip);
                            const membershipName = matchingMembership ? matchingMembership.nameMemberShip : 'N/A';

                            return (
                                <tr key={user.id}>
                                    <td>{index + 1}</td>
                                    <td>{user.full_name || 'N/A'}</td>
                                    <td>{user.dateEnd ? new Date(user.dateEnd).toLocaleString() : 'N/A'}</td>
                                    <td>{user.dateStart ? new Date(user.dateStart).toLocaleString() : 'N/A'}</td>
                                    <td>{user.email || 'N/A'}</td>
                                    <td>{user.address || 'N/A'}</td>
                                    <td>{membershipName}</td>
                                </tr>
                            );
                        })}
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
            `}</style>
        </div>
    );
}