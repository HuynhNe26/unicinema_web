import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginAdmin() {
    const [login, setLogin] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLogin({ ...login, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
             const response = await fetch("http://localhost:5000/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(login),
            });

            const data = await response.json();
            
            if (response.ok) {
                sessionStorage.setItem('token', JSON.stringify(data.token));
                navigate('/admin');
            } else {
                setError(data.message || 'Đăng nhập thất bại');
            }
     
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <form onSubmit={handleSubmit}>
                    <h1 style={styles.title}>HỆ THỐNG QUẢN LÝ</h1>
                    <h2 style={styles.subtitle}>UNI CINEMA</h2>
                    <h3 style={styles.loginText}>ĐĂNG NHẬP</h3>

                    {error && <p style={styles.error}>{error}</p>}

                    <input
                        type="text"
                        placeholder="Tên đăng nhập"
                        value={login.username}
                        name="username"
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                    <br />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={login.password}
                        name="password"
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                    <br />
                    <button type="submit" style={styles.button}>ĐĂNG NHẬP</button>
                </form>
            </div>
        </div>
    );
}

// Styles (CSS inline)
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '856px',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Arial, sans-serif',
    },
    loginBox: {
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '300px',
    },
    title: {
        color: '#1a73e8',
        fontSize: '24px',
        marginBottom: '5px',
    },
    subtitle: {
        color: '#5f6368',
        fontSize: '16px',
        marginBottom: '20px',
    },
    loginText: {
        color: '#202124',
        fontSize: '20px',
        marginBottom: '20px',
    },
    input: {
        width: '280px',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '14px',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#1a73e8',
        color: '#ffffff',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s',
    },
    error: {
        color: 'red',
        fontSize: '14px',
        marginBottom: '10px',
    },
};

