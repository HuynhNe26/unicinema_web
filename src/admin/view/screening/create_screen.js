import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import {db} from '../../../api/firebase/firebase'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/loading/loading';

const CreateScreen = () => {
  const [newScreen, setNewScreen] = useState({
    idScreening: '',
    dateTimeStart: '',
    dateTimeEnd: '',
    idMovie: '',
    idScreenRoom: ''
  });
  const [theaters, setTheaters] = useState([]);
  const [movies, setMovies] = useState([]);
  const [screenRooms, setScreenRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [filteredTheaters, setFilteredTheaters] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

  useEffect(() => {
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách phim
      const movieSnapshot = await getDocs(collection(db, "movies"));
      const movieList = movieSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMovies(movieList);

      // 2. Lấy danh sách rạp
      const theaterSnapshot = await getDocs(collection(db, "theaters"));
      const theaterList = theaterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTheaters(theaterList);

      // 3. Lấy danh sách phòng chiếu
      const screenRoomSnapshot = await getDocs(collection(db, "screeningRoom"));
      const screenRoomList = screenRoomSnapshot.docs.map(doc => {
        const room = { id: doc.id, ...doc.data() };
        const theater = theaterList.find(t => t.id === room.idTheater); // nối bảng
        return {
          ...room,
          nameTheater: theater?.nameTheater || 'Không xác định',
          nameProvince: theater?.nameProvince || ''
        };
      });

      setScreenRooms(screenRoomList);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      toast.error("Không thể lấy dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  fetchAllData();
}, []);

  // Sửa lỗi: Generate ID dựa trên ID cao nhất hiện tại thay vì đếm số lượng
  const generateScreeningId = async () => {
    try {
      // Lấy tất cả screening và sắp xếp theo ID giảm dần để lấy ID cao nhất
      const querySnapshot = await getDocs(collection(db, "screening"));
      let maxNumber = 0;
      
      querySnapshot.forEach((doc) => {
        const id = doc.id;
        if (id.startsWith('idScreening')) {
          const numberPart = id.replace('idScreening', '');
          const number = parseInt(numberPart, 10);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });
      
      const nextNumber = maxNumber + 1;
      return `idScreening${nextNumber.toString().padStart(23, '0')}`;
    } catch (error) {
      console.error("Error generating screening ID:", error);
      toast.error("Lỗi hệ thống, vui lòng thử lại!");
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
    setLoading(true);
    e.preventDefault();
    console.log(newScreen.dateTimeStart, newScreen.dateTimeEnd, newScreen.idMovie, newScreen.idScreenRoom, newScreen.stateScreening);
    if (!newScreen.dateTimeStart || !newScreen.dateTimeEnd || !newScreen.idMovie || !newScreen.idScreenRoom) {
      toast.error("Vui lòng điền đầy đủ thông tin!"); // Sửa từ success thành error
      setLoading(false);
      return;
    }
    const screeningId = await generateScreeningId();
    try {
      // Tạo tài liệu cha trong collection screening
      const screeningRef = doc(db, "screening", screeningId);
      await setDoc(screeningRef, {
        dateTimeStart: newScreen.dateTimeStart ? new Date(newScreen.dateTimeStart) : null,
        dateTimeEnd: newScreen.dateTimeEnd ? new Date(newScreen.dateTimeEnd) : null,
        idMovie: newScreen.idMovie,
        idScreenRoom: newScreen.idScreenRoom,
        stateScreening: true
      });

      toast.success("Suất chiếu đã được tạo thành công!");
      setNewScreen({
        idScreening: '',
        dateTimeStart: '',
        dateTimeEnd: '',
        idMovie: '',
        idScreenRoom: '',
        stateScreening: ''
      });
    } catch (error) {
      console.error("Lỗi khi tạo suất chiếu:", error);
      toast.error("Không thể tạo suất chiếu. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);

    const filtered = theaters.filter(theater => theater.nameProvince === province);
    setFilteredTheaters(filtered);

    // Lọc các room thuộc các rạp đã lọc
    const theaterIds = filtered.map(theater => theater.id);
    const filteredRoomList = screenRooms.filter(room => theaterIds.includes(room.idTheater));
    setFilteredRooms(filteredRoomList);

    setNewScreen(prev => ({
      ...prev,
      idScreenRoom: '',
      idMovie: ''
    }));
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <ToastContainer /> 
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
                {movie.nameMovie}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Chọn Tỉnh/Thành:</label>
          <select
            value={selectedProvince}
            onChange={handleProvinceChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="">Chọn tỉnh/thành</option>
            {[...new Set(theaters.map(t => t.nameProvince))].map((province, index) => (
              <option key={index} value={province}>{province}</option>
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
            {filteredRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.nameScreenRoom} - {room.nameTheater}
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