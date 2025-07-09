import React, { useState, useEffect } from 'react';
import { collection, setDoc, doc, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../api/firebase/firebase';
import Loading from '../../components/loading/loading';

export default function CreateTheater() {
    const [theater, setTheater] = useState({
        idTheater: '',
        addressTheater: '',
        latitudeTheater: '',
        longitudeTheater: '',
        nameProvince: '',
        nameTheater: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const getNextTheaterId = async () => {
            try {
                const coll = collection(db, "theaters");
                const snapshot = await getCountFromServer(coll);
                const count = snapshot.data().count + 1;
                const newId = `idTheater${String(count).padStart(3, '0')}`;
                setTheater(prevState => ({ ...prevState, idTheater: newId }));
            } catch (error) {
                console.error("Error fetching count:", error);
            } finally {
                setLoading(false);
            }
        };
        getNextTheaterId();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTheater(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!theater.addressTheater || !theater.latitudeTheater || !theater.longitudeTheater || !theater.nameProvince || !theater.nameTheater) {
            alert("Please fill all fields.");
            return;
        }
        try {
            const theaterData = { ...theater };
            console.log("Submitting data with ID:", theaterData.idTheater);
            await setDoc(doc(db, "theaters", theaterData.idTheater), theaterData);
            console.log("Document written with ID: ", theaterData.idTheater);
            alert("Thêm rạp thành công");

            const coll = collection(db, "theaters");
            const snapshot = await getCountFromServer(coll);
            const newCount = snapshot.data().count + 1;
            const newId = `idTheater${String(newCount).padStart(3, '0')}`;
            setTheater({
                idTheater: newId,
                addressTheater: '',
                latitudeTheater: '',
                longitudeTheater: '',
                nameProvince: '',
                nameTheater: ''
            });
        } catch (error) {
            console.error("Error adding theater: ", error.message);
            alert("Failed to add theater. Check console for details: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const provinces = [
        "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương",
        "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai",
        "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình",
        "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
        "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh",
        "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang",
        "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái", "TP. Hồ Chí Minh"
    ];

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <style>
                {`
                    .create-theater-container {
                        max-width: 500px;
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
                        width: 100%;
                        padding: 10px;
                        background-color: #1da1f2;
                        color: white;
                        border: none;
                        cursor: pointer;
                    }

                    button:hover {
                        background-color: #1a91da;
                    }
                `}
            </style>
            <div className="create-theater-container">
                <h2>THÊM RẠP PHIM</h2>
                <form onSubmit={handleSubmit}>
                    {/* <div className="form-group">
                        <label>ID Rạp:</label>
                        <input
                            type="text"
                            name="idTheater"
                            value={theater.idTheater}
                            readOnly
                        />
                    </div> */}
                    <div className="form-group">
                        <label>Địa chỉ:</label>
                        <input
                            type="text"
                            name="addressTheater"
                            value={theater.addressTheater}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Kinh độ:</label>
                        <input
                            type="text"
                            name="latitudeTheater"
                            value={theater.latitudeTheater}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Vĩ độ:</label>
                        <input
                            type="text"
                            name="longitudeTheater"
                            value={theater.longitudeTheater}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Tỉnh/Thành phố:</label>
                        <select
                            name="nameProvince"
                            value={theater.nameProvince}
                            onChange={handleChange}
                        >
                            <option value="">Chọn tỉnh/thành phố</option>
                            {provinces.map((province, index) => (
                                <option key={index} value={province}>{province}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Tên Rạp:</label>
                        <input
                            type="text"
                            name="nameTheater"
                            value={theater.nameTheater}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit">Thêm Rạp</button>
                </form>
            </div>
        </>
    );
}