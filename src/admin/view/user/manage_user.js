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
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setError('');
            setLoading(true);
            try {
                // Fetch users data
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

                // Fetch memberships data
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

    // Filter users based on search term (email)
    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination for filtered users
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Handle page change
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Handle search input change
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="manage-user-container">
            <ToastContainer />
            <div style={{display: 'flex'}}>
                <h2>Quản Lý Người Dùng</h2>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Gmail..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
            </div>
            {error && <div className="error">{error}</div>}
            {filteredUsers.length === 0 && !error ? (
                <p>Không tìm thấy người dùng nào.</p>
            ) : (
                <>
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
                            {currentUsers.map((user, index) => {
                                const matchingMembership = memberships.find(m => m.id === user.idMemberShip);
                                const membershipName = matchingMembership ? matchingMembership.nameMemberShip : 'N/A';

                                return (
                                    <tr key={user.id}>
                                        <td>{indexOfFirstUser + index + 1}</td>
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

                    {/* Pagination Controls */}
                    <div className="pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            Trước
                        </button>
                        <span className="pagination-info">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            Sau
                        </button>
                    </div>
                </>
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

                .search-container {
                    margin-left: 300px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .search-input {
                    padding: 10px;
                    width: 300px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 16px;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #002856;
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

                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 20px;
                    gap: 10px;
                }

                .pagination-button {
                    padding: 8px 16px;
                    border: 1px solid #002856;
                    background: #FFFFFF;
                    color: #002856;
                    border-radius: 5px;
                    cursor: pointer;
                }

                .pagination-button:disabled {
                    background: #f5f5f5;
                    color: #aaa;
                    cursor: not-allowed;
                }

                .pagination-button:hover:not(:disabled) {
                    background: #002856;
                    color: #FFFFFF;
                }

                .pagination-info {
                    font-size: 16px;
                    color: #002856;
                }
            `}</style>
        </div>
    );
}