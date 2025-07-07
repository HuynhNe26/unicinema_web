import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { db } from '../../../api/firebase/firebase';
import Loading from '../../components/loading/loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateProduct = () => {
  const [movieData, setMovieData] = useState({
    id: 0, // Sử dụng số nguyên làm ID
    actor: "",
    ageMovie: 0, // Khởi tạo là số nguyên
    descriptionMovie: "",
    idCategory: "",
    imageMovie1: "",
    imageMovie2: "",
    imageMovie3: "",
    languageMovie: "",
    nameMovie: "",
    performer: "",
    timeMovie: "",
    trailer: "",
    dateTimeStart: "", // Thêm trường dateTimeStart
    dateTimeEnd: ""    // Thêm trường dateTimeEnd
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading cho tải dữ liệu ban đầu
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading cho submit form

  useEffect(() => {
    const fetchLatestId = async () => {
      try {
        const moviesCollection = collection(db, "movies");
        const q = query(moviesCollection, orderBy("id", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        let newId = "idMovie0000000000008"; // Bắt đầu từ ID mặc định
        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0];
          const latestId = latestDoc.data().id; // Lấy chuỗi đầy đủ
          const numericPart = parseInt(latestId.replace("idMovie", ""), 10); // Lấy phần số
          if (!isNaN(numericPart)) {
            const newNumericPart = numericPart + 1;
            newId = `idMovie${newNumericPart.toString().padStart(13, "0")}`; 
          }
        }
        setMovieData(prevState => ({ ...prevState, id: newId }));
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        setMovieData(prevState => ({ ...prevState, id: "idMovie000000000008" }));
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, "categories");
        const querySnapshot = await getDocs(categoriesCollection);
        const categoryList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().nameCategory || "Không tên"
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Lỗi lấy thể loại:", error);
      }
    };

    fetchLatestId();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`); // Debug
    // Định dạng lại giá trị cho datetime-local và ageMovie
    let formattedValue;
    if (name === "dateTimeStart" || name === "dateTimeEnd") {
      formattedValue = value; // Giữ nguyên định dạng YYYY-MM-DDTHH:MM từ input
    } else if (name === "ageMovie") {
      formattedValue = value ? parseInt(value, 10) || 0 : 0; // Chuyển thành số nguyên, mặc định là 0
    } else if (name === "timeMovie") {
      formattedValue = value ? parseInt(value, 10) || 0 : 0; // Chuyển thành số nguyên, mặc định là 0
    } else {
      formattedValue = value;
    }
    setMovieData(prevState => ({
      ...prevState,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movieData.id) {
      toast.error("Lỗi hệ thống tạo phim. Vui lòng liên hệ admin!");
      return;
    }
    setIsSubmitting(true); // Bắt đầu loading khi submit
    try {
      // Chuyển đổi dateTimeStart và dateTimeEnd thành đối tượng Date
      const updatedMovieData = {
        ...movieData,
        ageMovie: movieData.ageMovie || 0, // Đảm bảo ageMovie là số
        dateTimeStart: movieData.dateTimeStart ? new Date(movieData.dateTimeStart) : null,
        dateTimeEnd: movieData.dateTimeEnd ? new Date(movieData.dateTimeEnd) : null,
      };
      await setDoc(doc(db, "movies", movieData.id.toString()), updatedMovieData); // Chuyển ID thành chuỗi
      toast.success("Phim được thêm thành công!");
      // Sau khi thành công, tạo ID mới
      const moviesCollection = collection(db, "movies");
      const q = query(moviesCollection, orderBy("id", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      let newId = 9;
      if (!querySnapshot.empty) {
        const latestDoc = querySnapshot.docs[0];
        newId = latestDoc.data().id + 1; // Tăng ID lên 1
      }
      setMovieData(prevState => ({
        ...prevState,
        id: newId,
        actor: "",
        ageMovie: 0, // Reset thành số nguyên
        descriptionMovie: "",
        idCategory: "",
        imageMovie1: "",
        imageMovie2: "",
        imageMovie3: "",
        languageMovie: "",
        nameMovie: "",
        performer: "",
        timeMovie: "",
        trailer: "",
        dateTimeStart: "", // Reset trường mới
        dateTimeEnd: ""    // Reset trường mới
      }));
    } catch (error) {
      console.error("Error uploading data: ", error);
      toast.error("Thêm phim thất bại! Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false); // Kết thúc loading sau khi hoàn tất
    }
  };

  // Hiển thị Loading nếu isLoading hoặc isSubmitting là true
  if (isLoading || isSubmitting) {
    return <Loading />;
  }

  return (
    <div className="app-container">
      <style>
        {`
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .app-container {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }

          .form-card {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
          }

          .form-title {
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            color: #1e40af;
            margin-bottom: 20px;
          }

          .movie-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }

          .form-input, .form-select {
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 5px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.3s;
          }

          .form-input:focus, .form-select:focus {
            border-color: #1e40af;
            box-shadow: 0 0 5px rgba(30, 64, 175, 0.3);
          }

          .form-textarea {
            height: 100px;
            resize: vertical;
          }

          .form-button {
            padding: 12px;
            background-color: #1e40af;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          .form-button:hover {
            background-color: #1e3a8a;
          }
        `}
      </style>
      <div className="form-card">
        <ToastContainer />
        <h1 className="form-title">THÊM PHIM</h1>
        <form onSubmit={handleSubmit} className="movie-form">
          <span className="span">ID Phim</span>
          <input
            type="text"
            name="id"
            value={movieData.id}
            onChange={handleChange}
            placeholder="Auto-generated ID"
            className="form-input"
            readOnly
          />
          <span className="span">Thể loại phim</span>
          <select
            name="idCategory"
            value={movieData.idCategory}
            onChange={handleChange}
            className="form-input form-select"
          >
            <option value="">Chọn thể loại phim</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <span className="span">Tên phim</span>
          <input
            type="text"
            name="nameMovie"
            value={movieData.nameMovie}
            onChange={handleChange}
            placeholder="Tên phim"
            className="form-input"
          />
          <span className="span">Tác giả</span>
          <input
            type="text"
            name="actor"
            value={movieData.actor}
            onChange={handleChange}
            placeholder="Tác giả"
            className="form-input"
          />
          <span className="span">Độ tuổi</span>
          <input
            type="number"
            name="ageMovie"
            value={movieData.ageMovie}
            onChange={handleChange}
            placeholder="Độ tuổi"
            className="form-input"
            min="0" // Giới hạn số nguyên không âm
          />
          <span className="span">Mô tả</span>
          <textarea
            name="descriptionMovie"
            value={movieData.descriptionMovie}
            onChange={handleChange}
            placeholder="Mô tả phim"
            className="form-input form-textarea"
          />
          <span className="span">Hình bìa</span>
          <input
            type="text"
            name="imageMovie1"
            value={movieData.imageMovie1}
            onChange={handleChange}
            placeholder="Url"
            className="form-input"
          />
          <span className="span">Hình ảnh 2 (nếu có)</span>
          <input
            type="text"
            name="imageMovie2"
            value={movieData.imageMovie2}
            onChange={handleChange}
            placeholder="Url"
            className="form-input"
          />
          <span className="span">Hình ảnh 3 (nếu có)</span>
          <input
            type="text"
            name="imageMovie3"
            value={movieData.imageMovie3}
            onChange={handleChange}
            placeholder="Url"
            className="form-input"
          />
          <span className="span">Ngôn ngữ</span>
          <input
            type="text"
            name="languageMovie"
            value={movieData.languageMovie}
            onChange={handleChange}
            placeholder="Ngôn ngữ"
            className="form-input"
          />
          <span className="span">Diễn viên</span>
          <input
            type="text"
            name="performer"
            value={movieData.performer}
            onChange={handleChange}
            placeholder="Diễn viên"
            className="form-input"
          />
          <span className="span">Thời lượng</span>
          <input
            type="number"
            name="timeMovie"
            value={movieData.timeMovie}
            onChange={handleChange}
            placeholder="Thời lượng"
            className="form-input"
          />
          <span className="span">Trailer</span>
          <input
            type="text"
            name="trailer"
            value={movieData.trailer}
            onChange={handleChange}
            placeholder="Trailer"
            className="form-input"
          />
          <span className="span">Ngày bắt đầu</span>
          <input
            type="datetime-local"
            name="dateTimeStart"
            value={movieData.dateTimeStart}
            onChange={handleChange}
            className="form-input"
          />
          <span className="span">Ngày kết thúc</span>
          <input
            type="datetime-local"
            name="dateTimeEnd"
            value={movieData.dateTimeEnd}
            onChange={handleChange}
            className="form-input"
          />
          <button type="submit" className="form-button" disabled={isSubmitting}>
            {isSubmitting ? "Đang thêm..." : "Thêm"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;