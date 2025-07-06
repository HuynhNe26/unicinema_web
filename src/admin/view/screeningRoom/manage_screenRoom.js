import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import {db} from '../../../api/firebase/firebase'

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
    const [theaters, setTheaters] = useState([]);
    const [availableProvinces, setAvailableProvinces] = useState([]);
    const [selectedScreenRoomId, setSelectedScreenRoomId] = useState('');

    useEffect(() => {
        const fetchTheaters = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "theaters"));
                const theaterList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTheaters(theaterList);
                const uniqueProvinces = [...new Set(theaterList.map(theater => theater.nameProvince))];
                setAvailableProvinces(uniqueProvinces);
            } catch (error) {
                console.error("Error fetching theaters:", error);
            }
        };
        fetchTheaters();
    }, []);

    useEffect(() => {
        const fetchScreenRooms = async () => {
            try {
                let q = collection(db, "screeningRoom");
                if (selectedProvince) {
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
            }
        };
        fetchScreenRooms();
    }, [selectedProvince, theaters]);

    useEffect(() => {
        const fetchScreenings = async () => {
            if (selectedScreenRoomId) {
                try {
                    const q = query(collection(db, "screening"), where("idScreenRoom", "==", selectedScreenRoomId));
                    const querySnapshot = await getDocs(q);
                    const screeningList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setScreenings(screeningList);
                } catch (error) {
                    console.error("Lỗi lấy dữ liệu suất chiếu:", error);
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
                await deleteDoc(doc(db, "screeningRoom", id));
                setScreenRooms(screenRooms.filter(room => room.id !== id));
                alert("Xóa phòng chiếu thành công!");
            } catch (error) {
                console.error("Lỗi xóa phòng chiếu:", error);
                alert("Xóa phòng chiếu thất bại! Lỗi: " + error.message);
            }
        }
    };

    const handleSelectScreenRoom = (id) => {
        setSelectedScreenRoomId(id);
        
    };

    return (
        <>
            <style>
                {`
                    .manage-screen-room-container {
                        padding: 20px;
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
                        onChange={(e) => setSelectedProvince(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        {availableProvinces.map((province, index) => (
                            <option key={index} value={province}>{province}</option>
                        ))}
                    </select>
                </div>
                
                <div className="room-list">
                    <h3>Danh Sách Phòng Chiếu</h3>
                    {screenRooms.map((room) => (
                        <div key={room.id} className="room-item">
                            <span>
                                {room.nameScreenRoom} (ID: {room.id}) - {room.stateScreenRoom}
                            </span>
                            <div>
                                <button onClick={() => handleSelectScreenRoom(room.idScreenRoom)}>Xem Suất Chiếu</button>
                                <button onClick={() => handleEditRoom(room)}>Sửa</button>
                                <button onClick={() => handleDeleteRoom(room.id)}>Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedScreenRoomId && (
                    <div className="screening-list">
                        <h3>Danh Sách Suất Chiếu</h3>
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