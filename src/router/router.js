import {useEffect} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginAdmin from '../admin/view/login_admin'
import NavbarAdmin from '../admin/components/navbar/navbar';

export default function Router() {
   

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin/login" element={<LoginAdmin />} />
                <Route path="/admin" element={<NavbarAdmin />}>
                </Route>
                <Route path="*" element={<div>404 - Trang không tìm thấy</div>} />
            </Routes>
        </BrowserRouter>
    );
}