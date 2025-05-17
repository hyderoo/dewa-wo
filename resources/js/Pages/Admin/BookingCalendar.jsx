import React, { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";

const BookingCalendar = ({ bookedDates }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [hoveredEvent, setHoveredEvent] = useState(null);

    // Generate calendar data for the current month
    const generateCalendarData = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // First day of the month
        const firstDay = new Date(year, month, 1);
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);

        // Get the number of days in the month
        const daysInMonth = lastDay.getDate();

        // Get the day of the week of the first day (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfWeek = firstDay.getDay();

        // Calculate the number of days from the previous month to display
        const prevMonthDays = firstDayOfWeek;

        // Get the number of days from the previous month
        const prevMonth = new Date(year, month, 0);
        const prevMonthDaysCount = prevMonth.getDate();

        // Calculate the number of days from the next month to display
        const nextMonthDays = (7 - ((daysInMonth + prevMonthDays) % 7)) % 7;

        // Generate calendar days
        const calendarDays = [];

        // Add days from the previous month
        for (let i = 0; i < prevMonthDays; i++) {
            const day = prevMonthDaysCount - prevMonthDays + i + 1;
            const date = new Date(year, month - 1, day);
            calendarDays.push({
                date,
                day,
                isCurrentMonth: false,
                isPrevMonth: true,
                isNextMonth: false,
            });
        }

        // Add days from the current month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            calendarDays.push({
                date,
                day: i,
                isCurrentMonth: true,
                isPrevMonth: false,
                isNextMonth: false,
            });
        }

        // Add days from the next month
        for (let i = 1; i <= nextMonthDays; i++) {
            const date = new Date(year, month + 1, i);
            calendarDays.push({
                date,
                day: i,
                isCurrentMonth: false,
                isPrevMonth: false,
                isNextMonth: true,
            });
        }

        return calendarDays;
    };

    // Check if a date is booked
    const isDateBooked = (date) => {
        if (!bookedDates || !bookedDates.length) return false;

        const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        return bookedDates.some(bookedDate => bookedDate.date === dateString);
    };

    // Get event information for a specific date
    const getEventForDate = (date) => {
        if (!bookedDates || !bookedDates.length) return null;

        const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        return bookedDates.find(bookedDate => bookedDate.date === dateString);
    };

    // Go to the previous month
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    // Go to the next month
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Handle day click
    const handleDayClick = (day) => {
        setSelectedDate(day.date);
    };

    // Format date for display
    const formatDate = (date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Check if a date is today
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Get status color class
    const getStatusColorClass = (status) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Active':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    // Render calendar days
    const renderCalendarDays = () => {
        const days = generateCalendarData();

        return days.map((day, index) => {
            const isBooked = isDateBooked(day.date);
            const event = getEventForDate(day.date);

            return (
                <div
                    key={index}
                    className={`
                        relative h-14 border border-gray-200 p-1 cursor-pointer transition-all
                        ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                        ${isToday(day.date) ? 'border-pink-300' : ''}
                        ${selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'border-pink-500 ring-2 ring-pink-200' : ''}
                        ${isBooked ? 'hover:bg-pink-50' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => isBooked && setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                >
                    <div className="text-right">{day.day}</div>

                    {isBooked && (
                        <div
                            className={`absolute bottom-0 left-0 right-0 h-2 ${event.statusColor === 'green' ? 'bg-green-500' : event.statusColor === 'blue' ? 'bg-blue-500' : event.statusColor === 'yellow' ? 'bg-yellow-500' : event.statusColor === 'red' ? 'bg-red-500' : 'bg-gray-500'}`}
                        ></div>
                    )}
                </div>
            );
        });
    };

    // Render weekday headers
    const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-pink-500" />
                    Kalender Booking
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                    {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </h3>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
                {weekdays.map((day, index) => (
                    <div key={index} className="text-center font-medium text-sm text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
                {renderCalendarDays()}
            </div>

            {hoveredEvent && (
                <div className="fixed z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
                    <div className="font-medium text-gray-900 mb-1">{hoveredEvent.client}</div>
                    <div className="text-sm text-gray-600 mb-1">{formatDate(new Date(hoveredEvent.date))}</div>
                    <div className="text-sm text-gray-600 mb-2">{hoveredEvent.venue}</div>
                    <div className={`text-xs inline-block px-2 py-1 rounded ${getStatusColorClass(hoveredEvent.status)}`}>
                        {hoveredEvent.status}
                    </div>
                </div>
            )}

            {selectedDate && (
                <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                        {formatDate(selectedDate)}
                    </h4>

                    {isDateBooked(selectedDate) ? (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {(() => {
                                const event = getEventForDate(selectedDate);
                                return (
                                    <div>
                                        <div className="font-medium text-gray-900 mb-1">{event.client}</div>
                                        <div className="text-sm text-gray-600 mb-1">{event.venue}</div>
                                        <div className="text-sm text-gray-600 mb-2">Order #{event.orderNumber}</div>
                                        <div className={`text-xs inline-block px-2 py-1 rounded ${getStatusColorClass(event.status)}`}>
                                            {event.status}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200 flex items-center">
                            <Info className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-green-700">Tanggal tersedia untuk booking</span>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Status:</div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
                        <span className="text-sm">Active</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-sm mr-2"></div>
                        <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                        <span className="text-sm">Completed</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
                        <span className="text-sm">Cancelled</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingCalendar;
