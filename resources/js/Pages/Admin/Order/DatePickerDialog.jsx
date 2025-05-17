import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const DatePickerDialog = ({
    isOpen,
    onClose,
    onDateSelect,
    bookedDates = [],
    initialDate = null,
    isCheckingDate = false
}) => {
    // State for the current month/year being viewed
    const [currentDate, setCurrentDate] = useState(
        initialDate ? new Date(initialDate) : new Date()
    );

    // Selected date
    const [selectedDate, setSelectedDate] = useState(initialDate);

    // Reset the view when opening the dialog
    useEffect(() => {
        if (isOpen) {
            setCurrentDate(initialDate ? new Date(initialDate) : new Date());
            setSelectedDate(initialDate);
        }
    }, [isOpen, initialDate]);

    // Handle month navigation
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Helper functions for calendar rendering
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    // Indonesians month names
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Check if a date is booked
    const isDateBooked = (year, month, day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return bookedDates.includes(dateStr);
    };

    // Check if a date is in the past
    const isDatePast = (year, month, day) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(year, month, day);
        return checkDate < today;
    };

    // Check if a date is selected
    const isDateSelected = (year, month, day) => {
        if (!selectedDate) return false;

        const selDate = new Date(selectedDate);
        return (
            selDate.getFullYear() === year &&
            selDate.getMonth() === month &&
            selDate.getDate() === day
        );
    };

    // Handle date selection
    const handleDateClick = (year, month, day) => {
        // Don't allow selecting past or booked dates
        if (isDatePast(year, month, day) || isDateBooked(year, month, day)) {
            return;
        }

        const newDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        setSelectedDate(newDate);
    };

    // Handle confirm button click
    const handleConfirm = () => {
        if (selectedDate) {
            onDateSelect(selectedDate);
            onClose();
        }
    };

    // Render the calendar grid
    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div key={`empty-${i}`} className="h-10 md:h-12"></div>
            );
        }

        // Calendar days
        for (let day = 1; day <= daysInMonth; day++) {
            const isBooked = isDateBooked(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
            );

            const isPast = isDatePast(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
            );

            const isSelected = isDateSelected(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
            );

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                    )}
                    className={`
                        h-10 md:h-12 flex items-center justify-center rounded-lg
                        text-sm md:text-base font-medium relative
                        ${isPast
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : isBooked
                                ? "bg-red-100 text-red-500 cursor-not-allowed"
                                : "bg-green-50 hover:bg-green-100 cursor-pointer"}
                        ${isSelected ? "ring-2 ring-pink-500" : ""}
                        transition-all duration-150
                    `}
                >
                    <span className="relative z-10">{day}</span>
                    {isBooked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-xs md:text-sm text-red-600 font-medium">
                                Booked
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="border-b p-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Pilih Tanggal Pernikahan</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Calendar */}
                <div className="p-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>

                        <h4 className="text-lg font-medium text-gray-800">
                            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h4>

                        <button
                            onClick={handleNextMonth}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                            <div
                                key={day}
                                className="h-8 flex items-center justify-center font-medium text-gray-600 text-sm"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {renderCalendar()}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gray-100 rounded"></div>
                            <span className="text-sm text-gray-600">Sudah Berlalu</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-red-100 rounded"></div>
                            <span className="text-sm text-gray-600">Sudah Dipesan</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-green-50 rounded"></div>
                            <span className="text-sm text-gray-600">Tersedia</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-pink-500 rounded"></div>
                            <span className="text-sm text-gray-600">Dipilih</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedDate || isCheckingDate}
                        className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors text-sm disabled:bg-pink-300 disabled:cursor-not-allowed"
                    >
                        {isCheckingDate ? "Memeriksa..." : "Konfirmasi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatePickerDialog;
