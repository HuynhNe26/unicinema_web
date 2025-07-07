import React, { useState } from "react";
import { db } from "../../../api/firebase/firebase";
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from "react-router";
import Loading from "../../components/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreatePromotion() {
    const [form, setForm] = useState({
        title: '',
        description: '',
        bannerImage: '',
        startDate: '',
        endDate: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError(null);
            await addDoc(collection(db, "promotionNews"), {
                title: form.title,
                description: form.description,
                bannerImage: form.bannerImage,
                startDate: form.startDate ? new Date(form.startDate) : null,
                endDate: form.endDate ? new Date(form.endDate) : null
            });
            toast.success("Tạo khuyến mãi thành công!");
            navigate('../manage_promotion');
        } catch (error) {
            console.error("Error creating promotion: ", error);
            toast.error("Lỗi khi tạo khuyến mãi!");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div>
            <ToastContainer />
            <h2>Tạo Khuyến Mãi</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Tiêu đề: </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        style={{ width: "100%", padding: "5px" }}
                        required
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label>Mô tả: </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        style={{ width: "100%", padding: "5px", height: "150px" }}
                        required
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label>URL hình banner: </label>
                    <input
                        type="text"
                        value={form.bannerImage}
                        onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                        style={{ width: "100%", padding: "5px" }}
                        required
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label>Ngày bắt đầu: </label>
                    <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        style={{ width: "100%", padding: "5px" }}
                        required
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label>Ngày kết thúc: </label>
                    <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        style={{ width: "100%", padding: "5px" }}
                        required
                    />
                </div>
                <div style={{ marginTop: "10px" }}>
                    <button
                        type="submit"
                        style={{
                            backgroundColor: "#4CAF50",
                            color: "white",
                            padding: "5px 10px",
                            border: "none",
                            cursor: "pointer",
                            marginRight: "10px"
                        }}
                    >
                        Tạo
                    </button>
                    <button
                        type="button"
                        style={{
                            backgroundColor: "#ccc",
                            color: "black",
                            padding: "5px 10px",
                            border: "none",
                            cursor: "pointer"
                        }}
                        onClick={() => navigate('../manage_promotion')}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}