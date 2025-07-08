import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../api/firebase/firebase";
import Loading from "../../components/loading/loading";

export default function MovieCalendar() {
  const [screenings, setScreenings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [screenRooms, setScreenRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  
  // Bộ lọc
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTheater, setSelectedTheater] = useState('');
  const [filteredScreenings, setFilteredScreenings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách phim
        const movieSnapshot = await getDocs(collection(db, "movies"));
        const movieList = movieSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(movieList);

        // Lấy danh sách rạp
        const theaterSnapshot = await getDocs(collection(db, "theaters"));
        const theaterList = theaterSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTheaters(theaterList);

        // Lấy danh sách phòng chiếu
        const screenRoomSnapshot = await getDocs(collection(db, "screeningRoom"));
        const screenRoomList = screenRoomSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setScreenRooms(screenRoomList);

        // Lấy danh sách suất chiếu
        const screeningSnapshot = await getDocs(collection(db, "screening"));
        const screeningList = screeningSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            dateTimeStart: data.dateTimeStart?.toDate ? data.dateTimeStart.toDate() : new Date(data.dateTimeStart),
            dateTimeEnd: data.dateTimeEnd?.toDate ? data.dateTimeEnd.toDate() : new Date(data.dateTimeEnd),
          };
        });

        // Kết hợp thông tin phim, rạp, phòng chiếu với suất chiếu
        const screeningsWithDetails = screeningList.map(screening => {
          const movie = movieList.find(m => m.id === screening.idMovie);
          const screenRoom = screenRoomList.find(sr => sr.idScreenRoom === screening.idScreenRoom);
          const theater = theaterList.find(t => t.id === screenRoom?.idTheater);
          
          return {
            ...screening,
            movieName: movie?.nameMovie || 'Phim không xác định',
            movieGenre: movie?.genreMovie || '',
            movieDuration: movie?.durationMovie || 0,
            theaterName: theater?.nameTheater || 'Rạp không xác định',
            theaterProvince: theater?.nameProvince || '',
            screenRoomName: screenRoom?.nameScreenRoom || 'Phòng không xác định',
            theaterId: theater?.id || '',
          };
        });

        setScreenings(screeningsWithDetails);
        setFilteredScreenings(screeningsWithDetails);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc suất chiếu theo tỉnh/rạp
  useEffect(() => {
    let filtered = screenings.filter(screening => screening.stateScreening);
    
    if (selectedProvince) {
      filtered = filtered.filter(screening => screening.theaterProvince === selectedProvince);
    }
    
    if (selectedTheater) {
      filtered = filtered.filter(screening => screening.theaterId === selectedTheater);
    }
    
    setFilteredScreenings(filtered);
  }, [screenings, selectedProvince, selectedTheater]);

  const getScreeningsForDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return filteredScreenings.filter(screening => {
      const startDate = new Date(screening.dateTimeStart);
      startDate.setHours(0, 0, 0, 0);
      
      return startDate.getTime() === targetDate.getTime();
    });
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const screeningsToday = getScreeningsForDate(date);
      const maxToShow = 2;
      const showing = screeningsToday.slice(0, maxToShow);

      if (screeningsToday.length === 0) return null;

      return (
        <div style={{ 
          fontSize: "10px", 
          padding: "2px",
          minHeight: "30px"
        }}>
          {showing.map((screening, index) => (
            <div key={index} style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              backgroundColor: '#e3f2fd',
              margin: '1px 0',
              padding: '1px 3px',
              borderRadius: '3px',
              color: '#1976d2'
            }}>
              🎬 {screening.movieName}
            </div>
          ))}
          {screeningsToday.length > maxToShow && (
            <div style={{ 
              color: '#666', 
              fontSize: '9px',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              +{screeningsToday.length - maxToShow} suất
            </div>
          )}
        </div>
      );
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const screeningsToday = getScreeningsForDate(date);
      if (screeningsToday.length > 0) {
        return 'has-screenings';
      }
    }
    return null;
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedTheater(''); // Reset rạp khi đổi tỉnh
  };

  const handleTheaterChange = (e) => {
    setSelectedTheater(e.target.value);
  };

  const getFilteredTheaters = () => {
    if (!selectedProvince) return [];
    return theaters.filter(theater => theater.nameProvince === selectedProvince);
  };

  const handleMonthChange = (e) => {
    const newMonth = Number(e.target.value);
    setSelectedMonth(newMonth);
    setSelectedDate(new Date(selectedYear, newMonth, 1));
  };

  const handleYearChange = (e) => {
    const newYear = Number(e.target.value);
    setSelectedYear(newYear);
    setSelectedDate(new Date(newYear, selectedMonth, 1));
  };

  const getSelectedDateScreenings = () => {
    return getScreeningsForDate(selectedDate);
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto' }}>
      <style>{`
        .has-screenings {
          background-color: #f0f8ff !important;
          border: 2px solid #1976d2 !important;
        }
        .react-calendar__tile {
          position: relative;
          height: 80px !important;
          padding: 2px !important;
        }
        .react-calendar__tile--active {
          background-color: #1976d2 !important;
          color: white !important;
        }
        .react-calendar__tile--active:hover {
          background-color: #1565c0 !important;
        }
        .react-calendar {
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
      `}</style>
      
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        color: '#333',
        borderBottom: '2px solid #1976d2',
        paddingBottom: '10px'
      }}>
        Lịch Chiếu Phim
      </h1>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ marginRight: '5px', fontWeight: 'bold' }}>Tỉnh/Thành:</label>
          <select 
            value={selectedProvince} 
            onChange={handleProvinceChange}
            style={{ 
              padding: '5px 10px', 
              borderRadius: '4px',
              border: '1px solid #ddd',
              minWidth: '150px'
            }}
          >
            <option value="">Tất cả tỉnh/thành</option>
            {[...new Set(theaters.map(t => t.nameProvince))].map((province, index) => (
              <option key={index} value={province}>{province}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ marginRight: '5px', fontWeight: 'bold' }}>Rạp chiếu:</label>
          <select 
            value={selectedTheater} 
            onChange={handleTheaterChange}
            style={{ 
              padding: '5px 10px', 
              borderRadius: '4px',
              border: '1px solid #ddd',
              minWidth: '150px'
            }}
            disabled={!selectedProvince}
          >
            <option value="">Tất cả rạp</option>
            {getFilteredTheaters().map((theater) => (
              <option key={theater.id} value={theater.id}>{theater.nameTheater}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ marginRight: '5px', fontWeight: 'bold' }}>Tháng:</label>
          <select 
            value={selectedMonth} 
            onChange={handleMonthChange}
            style={{ 
              padding: '5px 10px', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>{`Tháng ${i + 1}`}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ marginRight: '5px', fontWeight: 'bold' }}>Năm:</label>
          <select 
            value={selectedYear} 
            onChange={handleYearChange}
            style={{ 
              padding: '5px 10px', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            {Array.from({ length: 15 }).map((_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            activeStartDate={new Date(selectedYear, selectedMonth, 1)}
            locale="vi-VN"
          />
        </div>
        
        <div style={{ 
          width: '300px', 
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            color: '#495057',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '10px'
          }}>
            Suất chiếu ngày {selectedDate.toLocaleDateString('vi-VN')}
          </h3>
          
          {getSelectedDateScreenings().length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {getSelectedDateScreenings().map((screening, index) => (
                <div key={index} style={{
                  padding: '10px',
                  marginBottom: '10px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#1976d2', marginBottom: '5px' }}>
                    {screening.movieName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '3px' }}>
                    🏢 {screening.theaterName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '3px' }}>
                    🏠 {screening.screenRoomName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <div>⏰ {screening.dateTimeStart.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {screening.dateTimeEnd.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#6c757d',
              padding: '20px',
              fontStyle: 'italic'
            }}>
              Không có suất chiếu nào trong ngày này
            </div>
          )}
        </div>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>Chú thích:</strong> Các ngày có viền xanh là ngày có suất chiếu phim
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>📊 Tổng suất chiếu: <strong>{filteredScreenings.length}</strong></div>
          <div>🎬 Phim đang chiếu: <strong>{[...new Set(filteredScreenings.map(s => s.movieName))].length}</strong></div>
          {selectedProvince && <div>📍 Tỉnh/Thành: <strong>{selectedProvince}</strong></div>}
          {selectedTheater && <div>🏢 Rạp: <strong>{theaters.find(t => t.id === selectedTheater)?.nameTheater}</strong></div>}
        </div>
      </div>
    </div>
  );
}