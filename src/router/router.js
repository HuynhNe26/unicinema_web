import {useEffect} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginAdmin from '../admin/view/login_admin'
import NavbarAdmin from '../admin/components/navbar/navbar';
import ManageAdmin from '../admin/view/info_admin/manage_admin';
import NewAdmin from '../admin/view/info_admin/new_admin';
import ManageUser from '../admin/view/user/manage_user';
import ManageProduct from '../admin/view/product/manage_product';
import ProductDetails from '../admin/view/product/product_details';
import CreateProduct from '../admin/view/product/create_product';
import ManageTheater from '../admin/view/theater/manage_theater';
import CreateTheater from '../admin/view/theater/create_theater';
import CreateScreen from '../admin/view/screening/create_screen';
import CreateScreenRoom from '../admin/view/screeningRoom/create_screenRoom';
import ManageScreenRoom from '../admin/view/screeningRoom/manage_screenRoom';

export default function Router() {
   

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin/login" element={<LoginAdmin />} />
                <Route path="/admin" element={<NavbarAdmin />} >
                    <Route path="manage_admin" element={<ManageAdmin />} />
                    <Route path="new_admin" element={<NewAdmin />} />

                    <Route path="manage_user" element={<ManageUser />} />

                    {/**Quản lý sản phẩm */}
                    <Route path="manage_product" element={<ManageProduct />} />
                    <Route path="product_details/:id" element={<ProductDetails />} />
                    <Route path="create_product" element={<CreateProduct />} />

                    {/**Quản lý rạp */}
                    <Route path="manage_theater" element={<ManageTheater />} />
                    <Route path="create_theater" element={<CreateTheater />} />

                    {/**Quản lý suất chiếu */}
                    <Route path="create_screen" element={<CreateScreen />} />

                    {/**Quản lý phòng chiếu */}
                    <Route path="manage_screenRoom" element={<ManageScreenRoom />} />
                    <Route path="create_screenRoom" element={<CreateScreenRoom />} />

                </Route>
                <Route path="*" element={<div>404 - Trang không tìm thấy</div>} />
            </Routes>
        </BrowserRouter>
    );
}