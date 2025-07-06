import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import {db} from '../../../api/firebase/firebase'

const CreateScreen = () => {
  const [newScreen, setNewScreen] = useState({
    idScreening: '',
    dateTimeStart: '',
    dateTimeEnd: '',
    idMovie: '',
    idScreenRoom: ''
  });
  const [movies, setMovies] = useState([]);
  const [screenRooms, setScreenRooms] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        const movieList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMovies(movieList);
        console.log("Fetched movies:", movieList);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    const fetchScreenRooms = async () => {
      try {
        // Thử fetch từ collection screeningRoom độc lập
        const screenRoomSnapshot = await getDocs(collection(db, "screeningRoom"));
        let rooms = [];
        screenRoomSnapshot.forEach(doc => {
          rooms.push({
            id: doc.id,
            ...doc.data()
          });
        });
        if (rooms.length === 0) {
          console.warn("No screening rooms found in screeningRoom collection.");
        } else {
          console.log("Fetched screen rooms from screeningRoom:", rooms);
        }
        setScreenRooms(rooms);
      } catch (error) {
        console.error("Error fetching screen rooms:", error);
      }
    };

    fetchMovies();
    fetchScreenRooms();
  }, []);

  const generateScreeningId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "screening"));
      const count = querySnapshot.size;
      return `idScreening${(count + 1).toString().padStart(23, '0')}`;
    } catch (error) {
      console.error("Error generating screening ID:", error);
      return `idScreening000000000000000000000001`;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewScreen(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newScreen.dateTimeStart || !newScreen.dateTimeEnd || !newScreen.idMovie || !newScreen.idScreenRoom) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    const screeningId = await generateScreeningId();
    try {
      // Tạo tài liệu cha trong collection screening
      const screeningRef = doc(db, "screening", screeningId);
      await setDoc(screeningRef, {
        idScreening: screeningId,
        dateTimeStart: newScreen.dateTimeStart,
        dateTimeEnd: newScreen.dateTimeEnd,
        idMovie: newScreen.idMovie,
        stateScreening: true
      });

      // Tạo tài liệu trong sub-collection screeningRoom
      const screenRoomRef = doc(db, "screening", screeningId, "screeningRoom", newScreen.idScreenRoom);
      await setDoc(screenRoomRef, {
        idScreenRoom: newScreen.idScreenRoom
      });

      alert("Suất chiếu đã được tạo thành công!");
      setNewScreen({
        idScreening: '',
        dateTimeStart: '',
        dateTimeEnd: '',
        idMovie: '',
        idScreenRoom: ''
      });
    } catch (error) {
      console.error("Lỗi khi tạo suất chiếu:", error);
      alert("Không thể tạo suất chiếu. Vui lòng kiểm tra console để xem chi tiết!");
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>TẠO SUẤT CHIẾU MỚI</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Ngày giờ bắt đầu:</label>
          <input
            type="datetime-local"
            name="dateTimeStart"
            value={newScreen.dateTimeStart}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Ngày giờ kết thúc:</label>
          <input
            type="datetime-local"
            name="dateTimeEnd"
            value={newScreen.dateTimeEnd}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Chọn Phim:</label>
          <select
            name="idMovie"
            value={newScreen.idMovie}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          >
            <option value="">Chọn phim</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.nameMovie} (ID: {movie.id})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Chọn Phòng Chiếu:</label>
          <select
            name="idScreenRoom"
            value={newScreen.idScreenRoom}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          >
            <option value="">Chọn phòng chiếu</option>
            {screenRooms.map((room) => (
              <option key={room.id} value={room.idScreenRoom}>
                {room.nameScreenRoom || `Phòng ${room.id}`} (ID: {room.idScreenRoom})
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#1da1f2',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1a91da'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#1da1f2'}
        >
          Tạo Suất Chiếu
        </button>
      </form>
    </div>
  );
};

export default CreateScreen;