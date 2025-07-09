import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../../api/firebase/firebase';
import Loading from '../../components/loading/loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router';

export default function ManageScreenRoom() {
    const [screenRooms, setScreenRooms] = useState([]);
    const [screenings, setScreenings] = useState([]);
    const [newRoom, setNewRoom] = useState({
        idScreenRoom: '',
        idTheater: '',
        nameScreenRoom: '',
        quantityDesk: '',
        stateScreenRoom: '',
        active: true
    });
    const [editRoom, setEditRoom] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedTheaterId, setSelectedTheaterId] = useState('');
    const [theaters, setTheaters] = useState([]);
    const [availableProvinces, setAvailableProvinces] = useState([]);
    const [selectedScreenRoomId, setSelectedScreenRoomId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTheaters = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const querySnapshot = await getDocs(collection(db, "theaters"));
                const theaterList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTheaters(theaterList);
                const uniqueProvinces = [...new Set(theaterList.map(theater => theater.nameProvince))];
                setAvailableProvinces(uniqueProvinces);
            } catch (error) {
                console.error("Error fetching theaters:", error);
                setError("Không thể tải danh sách rạp. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTheaters();
    }, []);

    useEffect(() => {
        const fetchScreenRooms = async () => {
            try {
                setIsLoading(true);
                setError(null);
                let q = collection(db, "screeningRoom");
                if (selectedTheaterId) {
                    q = query(q, where("idTheater", "==", selectedTheaterId));
                } else if (selectedProvince) {
                    const theaterIds = theaters
                        .filter(theater => theater.nameProvince === selectedProvince)
                        .map(theater => theater.id);
                    if (theaterIds.length > 0) {
                        q = query(q, where("idTheater", "in", theaterIds));
                    } else {
                        setScreenRooms([]);
                        return;
                    }
                }
                const querySnapshot = await getDocs(q);
                const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setScreenRooms(rooms);
            } catch (error) {
                console.error("Lỗi lấy phòng chiếu:", error);
                setError("Không thể tải danh sách phòng chiếu. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchScreenRooms();
    }, [selectedProvince, selectedTheaterId, theaters]);

    useEffect(() => {
        const fetchScreenings = async () => {
            if (selectedScreenRoomId) {
                try {
                    setIsLoading(true);
                    setError(null);
                    const q = query(collection(db, "screening"), where("idScreenRoom", "==", selectedScreenRoomId));
                    const querySnapshot = await getDocs(q);
                    const screeningList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setScreenings(screeningList);
                } catch (error) {
                    console.error("Lỗi lấy dữ liệu suất chiếu:", error);
                    setError("Không thể tải danh sách suất chiếu. Vui lòng thử lại.");
                } finally {
                    setIsLoading(false);
                }
            } else {
                setScreenings([]);
            }
        };
        fetchScreenings();
    }, [selectedScreenRoomId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRoom(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleEditRoom = (room) => {
        setEditRoom(room);
        setNewRoom({ ...room });
    };

    const handleDeleteRoom = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa phòng chiếu " + id)) {
            try {
                setIsLoading(true);
                setError(null);
                await deleteDoc(doc(db, "screeningRoom", id));
                setScreenRooms(screenRooms.filter(room => room.id !== id));
                toast.success("Xóa phòng chiếu thành công!");
            } catch (error) {
                console.error("Lỗi xóa phòng chiếu:", error);
                toast.error("Xóa phòng chiếu thất bại!");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSelectScreenRoom = (id) => {
        sessionStorage.setItem("idScreen", id);
        setSelectedScreenRoomId(id); 
        navigate(`${id}`)
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="manage-screen-room-container">
                <ToastContainer />
                <h2>QUẢN LÝ PHÒNG CHIẾU</h2>
                <p style={{ color: "red", textAlign: "center" }}>{error}</p>
                <button
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#1da1f2',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        margin: '0 auto',
                        display: 'block'
                    }}
                    onClick={() => window.location.reload()}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1a91da'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#1da1f2'}
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    .manage-screen-room-container { 
                        max-width: 800px;
                        margin: 0 auto;
                    }

                    h2 {
                        text-align: center;
                        margin-bottom: 20px;
                    }

                    .form-group {
                        margin-bottom: 15px;
                    }

                    .form-group label {
                        display: block;
                        margin-bottom: 5px;
                    }

                    .form-group input, .form-group select {
                        width: 100%;
                        padding: 8px;
                        box-sizing: border-box;
                    }

                    button {
                        padding: 10px 20px;
                        background-color: #1da1f2;
                        color: white;
                        border: none;
                        cursor: pointer;
                        margin-right: 10px;
                    }

                    button:hover {
                        background-color: #1a91da;
                    }

                    .room-list, .screening-list {
                        margin-top: 20px;
                    }

                    .room-item, .screening-item {
                        border: 1px solid #ddd;
                        padding: 10px;
                        margin-bottom: 10px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                `}
            </style>
            <div className="manage-screen-room-container">
                <h2>QUẢN LÝ PHÒNG CHIẾU</h2>
                <div className="form-group">
                    <label>Chọn Tỉnh/Thành phố:</label>
                    <select
                        value={selectedProvince}
                        onChange={(e) => {
                            setSelectedProvince(e.target.value);
                            setSelectedTheaterId(''); // Reset rạp khi đổi tỉnh
                        }}
                    >
                        <option value="">Tất cả</option>
                        {availableProvinces.map((province, index) => (
                            <option key={index} value={province}>{province}</option>
                        ))}
                    </select>
                </div>
                
                {selectedProvince && (
                    <div className="form-group">
                        <label>Chọn Rạp:</label>
                        <select
                            value={selectedTheaterId}
                            onChange={(e) => {
                                const theaterId = e.target.value;
                                setSelectedTheaterId(theaterId);
                            }}
                        >
                            <option value="">Tất cả rạp</option>
                            {theaters
                                .filter(theater => theater.nameProvince === selectedProvince)
                                .map((theater) => (
                                    <option key={theater.id} value={theater.id}>
                                        {theater.nameTheater}
                                    </option>
                                ))}
                        </select>
                    </div>
                )}

                <div className="room-list">
                    <h3>Danh Sách Phòng Chiếu</h3>
                    {screenRooms.length === 0 && <p>Không có phòng chiếu nào.</p>}
                    {screenRooms.map((room) => (
                        <div key={room.id} className="room-item">
                            <span>
                                {room.nameScreenRoom} - {room.stateScreenRoom}
                            </span>
                            <div>
                                <button onClick={() => handleSelectScreenRoom(room.id)}>Xem Suất Chiếu</button>
                                <button onClick={() => handleEditRoom(room)}>Sửa</button>
                                <button onClick={() => handleDeleteRoom(room.id)}>Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedScreenRoomId && (
                    <div className="screening-list">
                        <h3>Danh Sách Suất Chiếu</h3>
                        {screenings.length === 0 && <p>Không có suất chiếu nào.</p>}
                        {screenings.map((screening) => (
                            <div key={screening.id} className="screening-item">
                                <span>
                                    ID: {screening.id} - Start: {screening.dateTimeStart} - End: {screening.dateTimeEnd}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}