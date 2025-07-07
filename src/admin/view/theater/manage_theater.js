import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../api/firebase/firebase';
import Loading from '../../components/loading/loading';

export default function ManageTheater() {
    const [theaters, setTheater] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTheater = async () => {
            setError('');
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'theaters'));
                const theaterList = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        nameTheater: data.nameTheater || 'N/A',
                        nameProvince: data.nameProvince || 'N/A',
                        addressTheater: data.addressTheater || 'N/A',
                        latitude: data.latitudeTheater || null,
                        longitude: data.longtitudeTheater || null,
                    };
                });
                setTheater(theaterList);
            } catch (err) {
                console.error('Error fetching theaters:', err);
                setError('Đã xảy ra lỗi khi tải danh sách rạp phim.');
                toast.error('Lỗi kết nối Firestore.');
            } finally {
                setLoading(false);
            }
        };

        fetchTheater();
    }, []);

    const handleDeleteTheater = async (theaterId) => {
        // Show confirmation dialog
        if (!window.confirm('Bạn có chắc chắn muốn xóa rạp này?')) {
            return;
        }

        setLoading(true);
        try {
            // Delete the theater document from Firestore
            await deleteDoc(doc(db, 'theaters', theaterId));
            // Update state to remove the deleted theater
            setTheater(theaters.filter(theater => theater.id !== theaterId));
            toast.success('Xóa rạp thành công!');
        } catch (err) {
            console.error('Error deleting theater:', err);
            toast.error('Đã xảy ra lỗi khi xóa rạp.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewOnMap = (latitude, longitude) => {
        if (latitude && longitude) {
            const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            window.open(googleMapsUrl, '_blank');
        } else {
            toast.error('Không có tọa độ kinh độ vĩ độ cho rạp này.');
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="manage-user-container">
            <ToastContainer />
            <h2>Quản Lý rạp</h2>
            {error && <div className="error">{error}</div>}
            {theaters.length === 0 && !error ? (
                <p>Không có rạp nào.</p>
            ) : (
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên rạp</th>
                            <th>Tỉnh/Thành phố</th>
                            <th>Địa chỉ</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {theaters.map((theater, index) => (
                            <tr key={theater.id}>
                                <td>{index + 1}</td>
                                <td>{theater.nameTheater}</td>
                                <td>{theater.nameProvince}</td>
                                <td>{theater.addressTheater}</td>
                                <td>
                                    <button
                                        onClick={() => handleViewOnMap(theater.latitude, theater.longitude)}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Chi tiết rạp
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTheater(theater.id)}
                                        style={{ backgroundColor: '#dc3545' }}
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
                .manage-user-container {
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

                .user-table button {
                    padding: 8px 12px;
                    background-color: #007bff;
                    color: #FFFFFF;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }

                .user-table button:hover {
                    background-color: #0056b3;
                }

                .user-table button[style*='background-color: #dc3545'] {
                    background-color: #dc3545;
                }

                .user-table button[style*='background-color: #dc3545']:hover {
                    background-color: #c82333;
                }
            `}</style>
        </div>
    );
}