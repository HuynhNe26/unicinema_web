import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/loading/loading';
import { db } from '../../../api/firebase/firebase';

const CreateScreenRoom = () => {
  const [newRoom, setNewRoom] = useState({
    idScreenRoom: '',
    idTheater: '',
    nameScreenRoom: '',
    quantityDesk: 140,
    stateScreenRoom: '',
    active: true
  });
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchTheaters = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "theaters"));
        const theaterList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTheaters(theaterList);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu rạp:", error);
      }
      finally {
        setLoading(false);
      }
    };
    fetchTheaters();
  }, []);

  const generateSequentialId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "screeningRoom"));
      const count = querySnapshot.size;
      return `idScreenRoom${(count + 1).toString().padStart(6, '0')}`;
    } catch (error) {
      console.error("Error generating sequential ID:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại!");
      return `idScreenRoom000001`;
    }
  };

  const generateDesks = (screenRoomId) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
    const desks = [];

    rows.forEach(row => {
      for (let i = 1; i <= 14; i++) {
        const deskId = `idDesk${row}${i.toString().padStart(2, '0')}`;
        desks.push({
          id: deskId,
          row: row,
          seat: i.toString().padStart(2, '0'),
          available: true
        });
      }
    });
    return desks;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoom.idTheater || !newRoom.nameScreenRoom || !newRoom.stateScreenRoom) {
      toast.error("Vui lòng điền đầy đủ thông tin!!");
      return;
    }
    const screenRoomId = await generateSequentialId();
    const roomData = { ...newRoom, idScreenRoom: screenRoomId };
    try {
      const screenRoomRef = await addDoc(collection(db, "screeningRoom"), roomData);

      const deskCollectionRef = collection(db, "screeningRoom", screenRoomId, "desk");
      const desks = generateDesks(screenRoomId);
      for (const desk of desks) {
        await setDoc(doc(deskCollectionRef, desk.id), {
          row: desk.row,
          seat: desk.seat,
          available: desk.available
        });
      }

      toast.success("Phòng chiếu được tạo thành công!");
      setNewRoom({
        idScreenRoom: '',
        idTheater: newRoom.idTheater,
        nameScreenRoom: '',
        quantityDesk: 140,
        stateScreenRoom: '',
        active: true
      });
    } catch (error) {
      console.error("Lỗi khi tạo phòng chiếu hoặc ghế:", error);
      toast.error("Không thể tạo phòng chiếu hoặc ghế. Vui lòng thử lại!");
    }
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
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>TẠO PHÒNG CHIẾU MỚI</h2>
      <form onSubmit={handleSubmit}>
        {/* <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>ID Phòng Chiếu:</label>
          <input
            type="text"
            name="idScreenRoom"
            value={newRoom.idScreenRoom}
            readOnly
            placeholder="Sẽ tự động tạo khi submit (từ 000001)"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div> */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Chọn Rạp:</label>
          <select
            name="idTheater"
            value={newRoom.idTheater}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="">Chọn rạp</option>
            {theaters.map((theater) => (
              <option key={theater.id} value={theater.id}>
                {theater.nameTheater} ({theater.nameProvince})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Tên Phòng Chiếu:</label>
          <input
            type="text"
            name="nameScreenRoom"
            value={newRoom.nameScreenRoom}
            onChange={handleInputChange}
            placeholder="Nhập tên phòng chiếu (ví dụ: H1)"
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Số Ghế:</label>
          <input
            type="number"
            name="quantityDesk"
            value={newRoom.quantityDesk}
            readOnly
            placeholder="140 (cố định)"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Trạng Thái:</label>
          <input
            type="text"
            name="stateScreenRoom"
            value={newRoom.stateScreenRoom}
            onChange={handleInputChange}
            placeholder="Nhập trạng thái (ví dụ: Đang hoạt động)"
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
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
          Tạo Phòng Chiếu
        </button>
      </form>
    </div>
  );
};

export default CreateScreenRoom;
