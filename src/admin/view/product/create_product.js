import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCmQ28yB0uCBOPa9dKbyWIYpH2gieJ3tWI",
  authDomain: "unicinema-80396.firebaseapp.com",
  projectId: "unicinema-80396",
  storageBucket: "unicinema-80396.firebasestorage.app",
  messagingSenderId: "503641676608",
  appId: "1:503641676608:web:f35437aacdbef9c4c2f8a5",
  measurementId: "G-N8SHR5E70L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CreateProduct = () => {
  const [movieData, setMovieData] = useState({
    id: "",
    actor: "",
    ageMovie: "",
    descriptionMovie: "",
    idCategory: "",
    imageMovie1: "",
    imageMovie2: "",
    imageMovie3: "",
    languageMovie: "",
    nameMovie: "",
    performer: "",
    timeMovie: "",
    trailer: ""
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestId = async () => {
      try {
        const moviesCollection = collection(db, "movies");
        const q = query(moviesCollection, orderBy("id", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        console.log("Query Snapshot:", querySnapshot.docs.map(doc => doc.id)); // Debug
        let newId = "idMovie0000000000009"; // Bắt đầu từ ID mới nhất của bạn (13 ký tự)
        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0];
          newId = latestDoc.id;
        }
        setMovieData(prevState => ({ ...prevState, id: newId }));
      } catch (error) {
        console.error("Error fetching latest ID:", error);
        setMovieData(prevState => ({ ...prevState, id: "idMovie0000000000009" })); // Fallback to latest known ID
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
          name: doc.data().nameCategory || "No name"
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchLatestId();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`); // Debug
    setMovieData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movieData.id) {
      alert("Id không được tạo. Xin vui lòng thử lại!");
      return;
    }
    console.log("Submitting movieData:", movieData); // Debug
    try {
      await setDoc(doc(db, "movies", movieData.id), movieData);
      alert("Phim được thêm thành công!");
      setMovieData(prevState => ({
        ...prevState,
        actor: "",
        ageMovie: "",
        descriptionMovie: "",
        idCategory: "",
        imageMovie1: "",
        imageMovie2: "",
        imageMovie3: "",
        languageMovie: "",
        nameMovie: "",
        performer: "",
        timeMovie: "",
        trailer: ""
      }));
    } catch (error) {
      console.error("Error uploading data: ", error);
      alert("Failed to upload movie data.");
    }
  };

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
        <h1 className="form-title">THÊM PHIM</h1>
        <form onSubmit={handleSubmit} className="movie-form">
          <input
            type="text"
            name="id"
            value={movieData.id}
            onChange={handleChange}
            placeholder="Auto-generated ID"
            className="form-input"
            readOnly
          />
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
          <input
            type="text"
            name="nameMovie"
            value={movieData.nameMovie}
            onChange={handleChange}
            placeholder="Tên phim"
            className="form-input"
          />
          <input
            type="text"
            name="actor"
            value={movieData.actor}
            onChange={handleChange}
            placeholder="Tác giả"
            className="form-input"
          />
          <input
            type="number"
            name="ageMovie"
            value={movieData.ageMovie}
            onChange={handleChange}
            placeholder="Độ tuổi"
            className="form-input"
          />
          <textarea
            name="descriptionMovie"
            value={movieData.descriptionMovie}
            onChange={handleChange}
            placeholder="Mô tả phim"
            className="form-input form-textarea"
          />
          <input
            type="text"
            name="imageMovie1"
            value={movieData.imageMovie1}
            onChange={handleChange}
            placeholder="Url"
            className="form-input"
          />
          <input
            type="text"
            name="imageMovie2"
            value={movieData.imageMovie2}
            onChange={handleChange}
            placeholder="Url"
            className="form-input"
          />
          <input
            type="text"
            name="imageMovie3"
            value={movieData.imageMovie3}
            onChange={handleChange}
            placeholder="Url"
            className="form-input"
          />
          <input
            type="text"
            name="languageMovie"
            value={movieData.languageMovie}
            onChange={handleChange}
            placeholder="Ngôn ngữ"
            className="form-input"
          />
          <input
            type="text"
            name="performer"
            value={movieData.performer}
            onChange={handleChange}
            placeholder="Diễn viên"
            className="form-input"
          />
          <input
            type="number"
            name="timeMovie"
            value={movieData.timeMovie}
            onChange={handleChange}
            placeholder="Thời lượng"
            className="form-input"
          />
          <input
            type="text"
            name="trailer"
            value={movieData.trailer}
            onChange={handleChange}
            placeholder="Trailer"
            className="form-input"
          />
          <button type="submit" className="form-button">Thêm</button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;