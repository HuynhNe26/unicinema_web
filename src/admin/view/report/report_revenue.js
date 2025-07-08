import React, { useState, useEffect } from "react";
import { db } from "../../../api/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần biểu đồ
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportRevenue() {
  const [orders, setOrders] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const querySnapshot = await getDocs(ordersRef);
      const ordersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Order raw data:", data); // 🐞 log tại đây
        return {
          id: doc.id,
          ...data,
          dateTimeOrder:
            data.dateTimeOrder && data.dateTimeOrder.seconds
              ? new Date(data.dateTimeOrder.seconds * 1000)
              : null,
        };
      });
      setOrders(ordersData);
    } catch (err) {
      setError("Lỗi khi lấy dữ liệu từ Firebase: " + err.message);
      console.error(err);
    }
  };

  fetchOrders();
}, []);


  useEffect(() => {
    const newMonthlyData = Array(12).fill(0);
    orders.forEach((order) => {
      if (order.dateTimeOrder && order.quantity && !isNaN(order.quantity)) {
        const year = order.dateTimeOrder.getFullYear();
        if (year === selectedYear) {
          const month = order.dateTimeOrder.getMonth();
          newMonthlyData[month] += Number(order.quantity);
        }
      }
    });
    setMonthlyData(newMonthlyData);
  }, [orders, selectedYear]);

  const years = [2025, 2026, 2027, 2028, 2029, 2030,2031];

  const data = {
    labels: [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ],
    datasets: [
      {
        label: "Số lượng lô hàng",
        data: monthlyData,
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Xu hướng số lượng lô hàng năm ${selectedYear}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Số lượng" },
      },
      x: {
        title: { display: true, text: "Tháng" },
      },
    },
  };

  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>Tổng hợp số lượng theo tháng</h2>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <Line data={data} options={options} />
    </div>
  );
}
