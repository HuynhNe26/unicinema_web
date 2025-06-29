import {useEffect} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginAdmin from '../admin/view/login_admin'
import NavbarAdmin from '../admin/components/navbar/navbar';
import ManageAdmin from '../admin/view/info_admin/manage_admin';
import NewAdmin from '../admin/view/info_admin/new_admin';
import ManageUser from '../admin/view/user/manage_user';

export default function Router() {
   

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin/login" element={<LoginAdmin />} />
                <Route path="/admin" element={<NavbarAdmin />} >
                    <Route path="manage_admin" element={<ManageAdmin />} />
                    <Route path="new_admin" element={<NewAdmin />} />

                    <Route path="manage_user" element={<ManageUser />} />
                </Route>
                <Route path="*" element={<div>404 - Trang không tìm thấy</div>} />
            </Routes>
        </BrowserRouter>
    );
}