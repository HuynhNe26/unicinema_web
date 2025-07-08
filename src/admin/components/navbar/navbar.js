import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import AuthModel from '../../../models/authAdmin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NavbarAdmin = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userLevel, setUserLevel] = useState(null);
    const [expandedMenus, setExpandedMenus] = useState({});
    const navigate = useNavigate();
    const id = AuthModel.getIdAdmin();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (!AuthModel.isAuthenticated()) {
                    navigate('/admin/login');
                } else {
                    const username = AuthModel.getUsername();
                    const level = AuthModel.getAdminLevel();
                    setAdmin(username);
                    setUserLevel(level);
                    const hasShownToast = localStorage.getItem('hasShownLoginToast');
                    if (!hasShownToast && AuthModel.isAuthenticated()) {
                        toast.success('Đăng nhập thành công!', { autoClose: 2000 });
                        localStorage.setItem('hasShownLoginToast', 'true');
                    }
                }
            } catch (error) {
                console.error('Auth error:', error);
                toast.error('Đã xảy ra lỗi khi xác thực. Vui lòng đăng nhập lại.');
                AuthModel.logout();
                navigate('/admin/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    const handleLogout = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!id) {
                toast.error("Lỗi: Không tìm thấy ID admin.");
                return;
            }
            const response = await fetch(`http://localhost:5000/logout-admin/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                AuthModel.logout();
                localStorage.removeItem('hasShownLoginToast');
                navigate('/admin/login');
            } else {
                const data = await response.json();
                toast.error(data.message || 'Đăng xuất thất bại');
            }
        } catch (error) {
            console.error('Logout error:', error.message);
            toast.error('Đã xảy ra lỗi khi đăng xuất');
        } finally {
            setLoading(false);
        }
    };

    const toggleMenu = (section) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const menus = {
        1: [
            {
                section: 'Thống kê',
                items: [{ to: 'statistics', label: 'THỐNG KÊ' }],
            },
            {
                section: 'Quản lý quản trị',
                items: [
                    { to: 'manage_admin', label: 'QUẢN LÝ QUẢN TRỊ VIÊN' },
                    { to: 'new_admin', label: 'THÊM QUẢN TRỊ VIÊN' },
                ],
            },
            {
                section: 'Quản lý người dùng',
                items: [
                    { to: 'manage_user', label: 'QUẢN LÝ NGƯỜI DÙNG' },
                ],
            },
            {
                section: 'Quản lý đơn hàng',
                items: [
                    { to: 'manage_order_all', label: 'QUẢN LÝ ĐƠN HÀNG' },
                    { to: 'manage_order_all', label: 'THÊM ĐƠN HÀNG' },

                ],
            },
            {
                section: 'Quản lý phim',
                items: [
                    { to: 'manage_product', label: 'QUẢN LÝ PHIM' },
                    { to: 'create_product', label: 'THÊM PHIM' },
                    { to: 'calendar_movie', label: 'LỊCH PHIM' },
                    { to: 'manage_order_all', label: 'QUẢN LÝ COMMENT PHIM' },
                ],
            },
            {
                section: 'Quản lý phòng chiếu',
                items: [
                    { to: 'manage_screenRoom', label: 'QUẢN LÝ PHÒNG CHIẾU' },
                    { to: 'create_screenRoom', label: 'THÊM PHÒNG CHIẾU' },
                    { to: 'create_screen', label: 'THÊM SUẤT CHIẾU' }
                ],
            },
            {
                section: 'Quản lý rạp',
                items: [
                    { to: 'manage_theater', label: 'QUẢN LÝ RẠP' },
                    { to: 'create_theater', label: 'THÊM RẠP' },
                ],
            },
            {
                section: 'Quản lý quà tặng',
                items: [
                    { to: 'manage_gift', label: 'QUẢN LÝ QUÀ TẶNG' },
                    { to: 'create_gift', label: 'THÊM QUÀ TẶNG' },
                    { to: 'manage_promotion', label: 'QUẢN LÝ KHUYẾN MÃI' },
                    { to: 'create_promotion', label: 'TẠO KHUYẾN MÃI' },
                ],
            },
            {
                section: 'Báo cáo',
                items: [
                    { to: 'report_revenue', label: 'BÁO CÁO DOANH THU' },
                    { to: 'report_admin', label: 'BÁO CÁO NHÂN VIÊN' },
                ],
            },
        ],
        2: [
            {
                section: 'Quản lý sản phẩm',
                items: [
                    { to: 'create_product', label: 'THÊM SẢN PHẨM' },
                    { to: 'create_product_details', label: 'THÊM CHI TIẾT SẢN PHẨM' },
                    { to: 'manage_product', label: 'QUẢN LÝ SẢN PHẨM' },
                ],
            },
            {
                section: 'Quản lý quản trị',
                items: [{ to: 'manage_admin_level', label: 'QUẢN LÝ QUẢN TRỊ VIÊN' }],
            },
            {
                section: 'Quản lý người dùng',
                items: [{ to: 'manage_user', label: 'QUẢN LÝ NGƯỜI DÙNG' }],
            },
            {
                section: 'Quản lý đơn hàng',
                items: [{ to: 'manage_order', label: 'QUẢN LÍ ĐƠN HÀNG' }],
            },
        ],
        3: [
            {
                section: 'Quản lý sản phẩm',
                items: [{ to: 'manage_product', label: 'QUẢN LÝ SẢN PHẨM' }],
            },
            {
                section: 'Quản lý đơn hàng',
                items: [{ to: 'manage_order', label: 'QUẢN LÍ ĐƠN HÀNG' }],
            },
            {
                section: 'Quản lý người dùng',
                items: [{ to: 'manage_user', label: 'QUẢN LÝ NGƯỜI DÙNG' }],
            },
        ],
    };

    const userMenus = menus[userLevel] || [];

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="container">
            <ToastContainer />
            <div className="sidebar">
                <div className="admin-profile">
                    <Link to={`/admin/${id}`} style={{ textDecoration: 'none', color: '#002856' }}>
                        <span>{admin}</span>
                    </Link>
                </div>
                <div className="menu-list">
                    {userMenus.map((menu, index) => (
                        <div key={index} className="menu-section">
                            <div
                                className="menu-section-header"
                                onClick={() => toggleMenu(menu.section)}
                            >
                                {menu.section}
                            </div>
                            <div
                                className={`menu-items ${expandedMenus[menu.section] ? 'expanded' : ''}`}
                            >
                                {menu.items.map((item, subIndex) => (
                                    <Link
                                        key={subIndex}
                                        to={item.to}
                                        className="menu-item"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={handleLogout} className="menu-section logout-btn">
                        Đăng xuất
                    </button>
                </div>
            </div>

            <div className="main-container">
                <div className="header"></div>
                <div className="layout">
                    <div className="button" onClick={() => navigate('/admin/manage_product')}>
                        <div className="text">
                            <div>Quản lý sản phẩm</div>
                        </div>
                    </div>
                    <div className="button" onClick={() => navigate('/admin/manage_order')}>
                        <div className="text">
                            <div>Quản lý đơn hàng</div>
                        </div>
                    </div>
                    <div className="button" onClick={() => navigate('/admin/manage_user')}>
                        <div className="text">
                            <div>Quản lý người dùng</div>
                        </div>
                    </div>
                </div>

                <div className="main_content">
                    <main>
                        <Outlet />
                    </main>
                </div>
            </div>

            <style>{`
                body {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    margin: 0;
                    padding: 0;
                }

                .container {
                    display: flex;
                    background: #EDEEF0;
                    border-radius: 10px;
                    padding: 10px;
                    min-height: 850px;
                }

                .sidebar {
                    width: 15,5%;
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-left: 15px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .admin-profile {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 20px 0 30px 30px;
                }

                .menu-list {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .menu-section {
                    margin-bottom: 5px;
                }

                .menu-section-header {
                    background: white;
                    border-radius: 5px;
                    padding: 15px 30px;
                    font-size: 14px;
                    color: #002856;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    transition: background 0.3s, color 0.3s;
                }

                .menu-section-header:hover {
                    background: #002856;
                    color: #FFFFFF;
                }

                .menu-items {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                    padding-left: 20px;
                }

                .menu-items.expanded {
                    max-height: 500px; /* Adjust based on content */
                }

                .menu-item {
                    display: block;
                    padding: 10px 30px;
                    font-size: 13px;
                    color: #002856;
                    text-decoration: none;
                    transition: background 0.3s, color 0.3s;
                }

                .menu-item:hover {
                    background: #002856;
                    color: #FFFFFF;
                }

                .arrow {
                    font-size: 12px;
                    transition: transform 0.3s ease;
                }

                .arrow.expanded {
                    transform: rotate(180deg);
                }

                .logout-btn {
                    background: none;
                    border: none;
                    text-align: left;
                    padding: 15px 30px;
                    font-size: 14px;
                    color: #002856;
                    cursor: pointer;
                    font-weight: bold;
                }

                .logout-btn:hover {
                    background: #002856;
                    color: #FFFFFF;
                }

                .main-container {
                    flex: 1;
                    padding: 0 20px;
                }

                .header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .layout {
                    display: flex;
                    gap: 20px;
                    padding: 0;
                }

                .layout .button {
                    display: flex;
                    align-items: center;
                    width: 180px;
                    height: 60px;
                    margin: 20px 0;
                    background: #FFFFFF;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: background 0.3s, box-shadow 0.3s;
                    gap: 15px;
                }

                .layout .button:hover {
                    background: #002856;
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
                }

                .layout .button .text {
                    font-size: 13px;
                    color: #002856;
                    font-weight: 500;
                }

                .layout .button:hover .text {
                    color: white;
                }

                .main_content {
                    width: 1100px;
                    padding: 20px;
                    background: #FFFFFF;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    min-height: 500px;
                }

                .loading {
                    text-align: center;
                    padding: 20px;
                    color: #002856;
                    font-size: 18px;
                }
            `}</style>
        </div>
    );
};

export default NavbarAdmin;