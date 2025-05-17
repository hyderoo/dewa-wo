import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    ReferenceLine,
    Label,
} from "recharts";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import BookingCalendar from "./BookingCalendar";

const DashboardContent = () => {
    const { analyticsData, timeRange } = usePage().props;
    const [chartType, setChartType] = useState("line"); // 'line' or 'bar'
    const [chartData, setChartData] = useState([]);
    const [yAxisDomain, setYAxisDomain] = useState([0, 'auto']);

    // Format chart data and set optimal Y axis domain
    useEffect(() => {
        if (analyticsData?.revenue?.monthly && analyticsData.revenue.monthly.length > 0) {
            // Make a copy of the data so we don't modify the original
            const processedData = [...analyticsData.revenue.monthly];

            // Find average value to help determine outliers
            const values = processedData.map(item => item.value);
            const average = values.reduce((a, b) => a + b, 0) / values.length;

            // Find max value (excluding extreme outliers)
            const reasonableValues = values.filter(v => v < average * 5); // Filter extreme outliers
            const maxValue = reasonableValues.length > 0
                ? Math.max(...reasonableValues)
                : Math.max(...values);

            // Set y-axis domain with some padding
            setYAxisDomain([0, maxValue * 1.2]);

            // Set chart data
            setChartData(processedData);
        }
    }, [analyticsData]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const handleTimeRangeChange = (e) => {
        const newTimeRange = e.target.value;
        router.get(route('admin.dashboard'), { timeRange: newTimeRange }, {
            preserveState: true,
            replace: true
        });
    };

    // Calculate conversion rate
    const conversionRate = analyticsData?.orders?.total > 0
        ? Math.round((analyticsData.orders.completed / analyticsData.orders.total) * 100)
        : 0;

    // Calculate average order value
    const averageOrderValue = analyticsData?.orders?.total > 0
        ? analyticsData.revenue.total / analyticsData.orders.total
        : 0;

    // Custom tooltip formatter to handle outliers
    const customTooltipFormatter = (value, name, props) => {
        return formatCurrency(value);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 text-gray-600">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Dashboard Analytics
                        </h1>
                        <p className="text-gray-500">Ringkasan performa bisnis Anda</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <select
                            className="bg-white border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                        >
                            <option value="7D">7 Hari Terakhir</option>
                            <option value="1M">30 Hari Terakhir</option>
                            <option value="3M">3 Bulan Terakhir</option>
                            <option value="1Y">1 Tahun</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Revenue */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500">Total Pendapatan</h3>
                            <span
                                className={`px-2 py-1 rounded-full text-sm ${analyticsData?.revenue?.growth >= 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {analyticsData?.revenue?.growth}%
                            </span>
                        </div>
                        <p className="text-2xl font-semibold mt-2">
                            {formatCurrency(analyticsData?.revenue?.total || 0)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Bulan ini: {formatCurrency(analyticsData?.revenue?.lastMonth || 0)}
                        </p>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-gray-500">Total Pesanan</h3>
                        <p className="text-2xl font-semibold mt-2">
                            {analyticsData?.orders?.total || 0}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-green-600">
                                {analyticsData?.orders?.active || 0} Active
                            </span>
                            <span className="text-sm text-gray-300">|</span>
                            <span className="text-sm text-gray-600">
                                {analyticsData?.orders?.completed || 0} Completed
                            </span>
                        </div>
                    </div>

                    {/* Average Order Value */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-gray-500">Rata-rata Nilai Pesanan</h3>
                        <p className="text-2xl font-semibold mt-2">
                            {formatCurrency(averageOrderValue)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Per transaksi</p>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-gray-500">Tingkat Konversi</h3>
                        <p className="text-2xl font-semibold mt-2">{conversionRate}%</p>
                        <p className="text-sm text-gray-500 mt-1">Pesanan selesai</p>
                    </div>
                </div>

                {/* Visual Representations Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Revenue Visualization */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Pendapatan Bulanan
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setChartType("line")}
                                        className={`px-3 py-1 rounded ${chartType === "line"
                                            ? "bg-pink-500 text-white"
                                            : "bg-gray-100"
                                            }`}
                                    >
                                        Line
                                    </button>
                                    <button
                                        onClick={() => setChartType("bar")}
                                        className={`px-3 py-1 rounded ${chartType === "bar"
                                            ? "bg-pink-500 text-white"
                                            : "bg-gray-100"
                                            }`}
                                    >
                                        Bar
                                    </button>
                                </div>
                            </div>
                        </div>
                        {chartData && chartData.length > 0 ? (
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === "line" ? (
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis
                                                domain={yAxisDomain}
                                                tickFormatter={(value) => {
                                                    // Format large numbers more readably
                                                    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                                    return value;
                                                }}
                                            />
                                            <Tooltip
                                                formatter={customTooltipFormatter}
                                                labelFormatter={(label) => `Bulan: ${label}`}
                                            />
                                            <ReferenceLine y={0} stroke="#000" />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#ec4899"
                                                strokeWidth={2}
                                                dot={{ fill: "#ec4899" }}
                                                animationDuration={750}
                                            />
                                        </LineChart>
                                    ) : (
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis
                                                domain={yAxisDomain}
                                                tickFormatter={(value) => {
                                                    // Format large numbers more readably
                                                    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                                    return value;
                                                }}
                                            />
                                            <Tooltip
                                                formatter={customTooltipFormatter}
                                                labelFormatter={(label) => `Bulan: ${label}`}
                                            />
                                            <ReferenceLine y={0} stroke="#000" />
                                            <Bar
                                                dataKey="value"
                                                fill="#ec4899"
                                                animationDuration={750}
                                            />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-80 w-full flex items-center justify-center">
                                <p className="text-gray-500">Tidak ada data pendapatan untuk ditampilkan</p>
                            </div>
                        )}
                        <div className="mt-3 text-xs text-gray-500 text-center">
                            *Nilai dalam satuan rupiah. Skala grafik disesuaikan untuk visualisasi optimal.
                        </div>
                    </div>

                    {/* Booking Calendar */}
                    {analyticsData?.calendar && (
                        <BookingCalendar bookedDates={analyticsData.calendar.bookedDates} />
                    )}
                </div>

                {/* Package Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Distribusi Paket
                    </h2>
                    {analyticsData?.packages && analyticsData.packages.length > 0 ? (
                        <div className="space-y-4">
                            {analyticsData.packages.map((pkg, index) => {
                                const totalBookings = analyticsData.packages.reduce(
                                    (acc, curr) => acc + curr.bookings, 0
                                );
                                const percentage = totalBookings > 0
                                    ? (pkg.bookings / totalBookings) * 100
                                    : 0;

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>{pkg.name}</span>
                                            <span>{pkg.bookings} bookings</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-pink-500 h-2 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-gray-500">Tidak ada data paket untuk ditampilkan</p>
                        </div>
                    )}
                </div>

                {/* Package Performance */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Performa Paket Layanan
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            {analyticsData?.packages && analyticsData.packages.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-500">
                                            <th className="pb-4">Nama Paket</th>
                                            <th className="pb-4">Total Booking</th>
                                            <th className="pb-4">Total Pendapatan</th>
                                            <th className="pb-4">Harga Rata-rata</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analyticsData.packages.map((pkg, index) => (
                                            <tr key={index} className="border-t border-gray-100">
                                                <td className="py-4">{pkg.name}</td>
                                                <td className="py-4">{pkg.bookings}</td>
                                                <td className="py-4">{formatCurrency(pkg.revenue)}</td>
                                                <td className="py-4">
                                                    {formatCurrency(pkg.averagePrice)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500">Tidak ada data paket untuk ditampilkan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Pesanan Terbaru
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            {analyticsData?.recentOrders && analyticsData.recentOrders.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-500">
                                            <th className="pb-4">ID</th>
                                            <th className="pb-4">Client</th>
                                            <th className="pb-4">Paket</th>
                                            <th className="pb-4">Tanggal</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4">Nilai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analyticsData.recentOrders.map((order, index) => (
                                            <tr key={index} className="border-t border-gray-100">
                                                <td className="py-4">{order.id}</td>
                                                <td className="py-4">{order.client}</td>
                                                <td className="py-4">{order.package}</td>
                                                <td className="py-4">
                                                    {new Date(order.date).toLocaleDateString("id-ID")}
                                                </td>
                                                <td className="py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-sm ${order.status === "Active"
                                                            ? "bg-green-100 text-green-800"
                                                            : order.status === "Completed"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : order.status === "Pending"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-4">{formatCurrency(order.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500">Tidak ada pesanan terbaru untuk ditampilkan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    return (
        <AdminLayout activeMenu="dashboard">
            <Head title="Dashboard" />
            <DashboardContent />
        </AdminLayout>
    );
};

export default Dashboard;
