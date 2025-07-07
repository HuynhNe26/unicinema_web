import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../api/firebase/firebase";

export default function MovieCalendar() {
  const [movies, setMovies] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const snapshot = await getDocs(collection(db, "movies"));
        const movieList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(movieList);
      } catch (error) {
        console.error("Lỗi khi lấy phim:", error);
      }
    };
    fetchMovies();
  }, []);

  const getMoviesForDate = (date) => {
    return movies.filter(movie => {
      const start = new Date(movie.dateTimeStart?.seconds * 1000);
      const end = new Date(movie.dateTimeEnd?.seconds * 1000);
      return date >= start && date <= end;
    });
  };

  const tileContent = ({ date, view }) => {
  if (view === "month") {
    const moviesToday = getMoviesForDate(date);
    const maxToShow = 2;
    const showing = moviesToday.slice(0, maxToShow);

    return (
      <div style={{ fontSize: "10px", padding: "2px" }}>
        {showing.map((movie, index) => (
          <div key={index} style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            🎬 {movie.nameMovie}
          </div>
        ))}
        {moviesToday.length > maxToShow && (
          <div style={{ color: 'gray', fontSize: '9px' }}>+{moviesToday.length - maxToShow} phim</div>
        )}
      </div>
    );
  }
};


  const handleMonthChange = (e) => setSelectedMonth(Number(e.target.value));
  const handleYearChange = (e) => setSelectedYear(Number(e.target.value));

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center' }}>Lịch chiếu phim</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
        <select value={selectedMonth} onChange={handleMonthChange}>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>{`Tháng ${i + 1}`}</option>
          ))}
        </select>
        <select value={selectedYear} onChange={handleYearChange}>
          {Array.from({ length: 10 }).map((_, i) => {
            const year = new Date().getFullYear() - 5 + i;
            return <option key={year} value={year}>{year}</option>;
          })}
        </select>
      </div>
      <Calendar
        style={{width: '1000px'}}
        value={selectedDate}
        onChange={setSelectedDate}
        tileContent={tileContent}
        activeStartDate={new Date(selectedYear, selectedMonth, 1)}
      />
    </div>
  );
}
