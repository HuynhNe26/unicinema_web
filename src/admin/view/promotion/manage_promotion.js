import React, { useState, useEffect } from "react";
import { db } from "../../../api/firebase/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from "react-router";
import Loading from "../../components/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ManagePromotion() {
    const [promotions, setPromotions] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        bannerImage: '',
        startDate: '',
        endDate: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const snapshot = await getDocs(collection(db, "promotionNews"));
                if (snapshot.empty) {
                    setPromotions([]);
                    return;
                }
                const promotionsData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        startDate: data.startDate ? new Date(data.startDate.toDate()).toISOString().split('T')[0] : '',
                        endDate: data.endDate ? new Date(data.endDate.toDate()).toISOString().split('T')[0] : '',
                    };
                });
                setPromotions(promotionsData);
            } catch (error) {
                console.error("Error fetching promotions: ", error);
                toast.error("Không thể tải dữ liệu khuyến mãi. Vui lòng kiểm tra kết nối hoặc thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const handleEditClick = (promo) => {
        setEditingId(promo.id);
        setEditForm({
            title: promo.title || '',
            description: promo.description || '',
            bannerImage: promo.bannerImage || '',
            startDate: promo.startDate || '',
            endDate: promo.endDate || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError(null);
            const promoRef = doc(db, "promotionNews", editingId);
            await updateDoc(promoRef, {
                title: editForm.title,
                description: editForm.description,
                bannerImage: editForm.bannerImage,
                startDate: editForm.startDate ? new Date(editForm.startDate) : null,
                endDate: editForm.endDate ? new Date(editForm.endDate) : null
            });
            setPromotions(promotions.map(promo =>
                promo.id === editingId ? { ...promo, ...editForm } : promo
            ));
            setEditingId(null);
            toast.success("Cập nhật thành công!");
        } catch (error) {
            console.error("Error updating promotion: ", error);
            toast.error("Lỗi khi cập nhật khuyến mãi!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa khuyến mãi này?")) {
            try {
                setIsLoading(true);
                setError(null);
                await deleteDoc(doc(db, "promotionNews", id));
                setPromotions(promotions.filter(promo => promo.id !== id));
                setEditingId(null);
                toast.success("Xóa thành công!");
            } catch (error) {
                console.error("Error deleting promotion: ", error);
                toast.error("Lỗi khi xóa khuyến mãi!");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setError(null);
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div>
                <h1 style={{ textAlign: 'center'}}>Quản lý Khuyến mãi</h1>
                <p style={{ color: "red" }}>{error}</p>
                <button
                    style={{ marginBottom: "20px" }}
                    onClick={() => window.location.reload()}
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div>
            <ToastContainer />
            <h1 style={{ textAlign: 'center'}}>Quản lý Khuyến mãi</h1>
            <button style={{ marginBottom: "20px", width: '200px', height: '40px' }} onClick={() => navigate('../create_promotion')}>
                Tạo khuyến mãi
            </button>
            {promotions.length === 0 && <p>Không có khuyến mãi nào.</p>}
            {promotions.map((promo) => (
                <div key={promo.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
                    <a href={promo.bannerImage} style={{ color: "red", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">
                        Hình ảnh (Vui lòng click vào để xem!)
                    </a>
                    <p>Tiêu đề: {promo.title || "N/A"}</p>
                    <p>Mô tả: {promo.description || "N/A"}</p>
                    <p>Ngày bắt đầu: {promo.startDate || "N/A"}</p>
                    <p>Ngày kết thúc: {promo.endDate || "N/A"}</p>
                    <div style={{ marginTop: "10px" }}>
                        <button
                            style={{
                                backgroundColor: "#4CAF50",
                                color: "white",
                                padding: "5px 10px",
                                border: "none",
                                cursor: "pointer",
                                marginRight: "10px"
                            }}
                            onClick={() => handleEditClick(promo)}
                        >
                            Chỉnh sửa
                        </button>
                        <button
                            style={{
                                backgroundColor: "#ff0000",
                                color: "white",
                                padding: "5px 10px",
                                border: "none",
                                cursor: "pointer"
                            }}
                            onClick={() => handleDelete(promo.id)}
                        >
                            Xóa
                        </button>
                    </div>

                    {editingId === promo.id && (
                        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd" }}>
                            <h4>Chỉnh sửa Khuyến mãi</h4>
                            <form onSubmit={handleUpdate}>
                                <div style={{ marginBottom: "10px" }}>
                                    <label>Tiêu đề: </label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        style={{ width: "100%", padding: "5px" }}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <label>Mô tả: </label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        style={{ width: "100%", padding: "5px", height: "150px" }}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <label>URL hình banner: </label>
                                    <input
                                        type="text"
                                        value={editForm.bannerImage}
                                        onChange={(e) => setEditForm({ ...editForm, bannerImage: e.target.value })}
                                        style={{ width: "100%", padding: "5px" }}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <label>Ngày bắt đầu: </label>
                                    <input
                                        type="date"
                                        value={editForm.startDate}
                                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                        style={{ width: "100%", padding: "5px" }}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <label>Ngày kết thúc: </label>
                                    <input
                                        type="date"
                                        value={editForm.endDate}
                                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
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
                                        Lưu
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
                                        onClick={handleCancel}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}