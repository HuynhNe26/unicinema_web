import React from "react";
import { useNavigate } from "react-router-dom";

export default function Page404() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>404</h1>
        <p>Trang bạn đang tìm không tồn tại hoặc đã bị mất kết nối.</p>
        <button onClick={handleBack}>Quay lại trang chủ</button>
      </div>

      <style>{`
        .error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 856px;
          background: linear-gradient(135deg, #f8f9fa, #dbe9f4);
          font-family: 'Segoe UI', sans-serif;
          text-align: center;
        }

        .error-content {
          background: #fff;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          animation: fadeIn 0.5s ease-in-out;
        }

        .error-content h1 {
          font-size: 100px;
          margin: 0;
          color: #007bff;
        }

        .error-content p {
          font-size: 18px;
          margin: 20px 0;
          color: #555;
        }

        .error-content button {
          padding: 10px 20px;
          font-size: 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .error-content button:hover {
          background-color: #0056b3;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .error-content h1 {
            font-size: 70px;
          }

          .error-content {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
}
