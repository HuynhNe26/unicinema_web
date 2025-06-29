class AuthModel {
    // Lưu token vào sessionStorage
    static saveToken(token) {
        sessionStorage.setItem('token', JSON.stringify(token));
    }

    // Lấy token từ sessionStorage
    static getToken() {
        const token = sessionStorage.getItem('token');
        return token ? JSON.parse(token) : null;
    }

    static isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = this.decodeToken(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > currentTime; // True nếu token chưa hết hạn
        } catch (error) {
            console.error('Invalid token:', error);
            return false;
        }
    }

    // Giải mã token để lấy thông tin
    static decodeToken(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    }

    // Lấy username từ token
    static getUsername() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = this.decodeToken(token);
            return payload.username || null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    static getIdAdmin() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = this.decodeToken(token);
            return payload.id_admin || null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    static getAdminLevel() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = this.decodeToken(token);
            return payload.level || null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Xử lý đăng xuất
    static logout() {
        sessionStorage.removeItem('token');
    }
}

export default AuthModel;