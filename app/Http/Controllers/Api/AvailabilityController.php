<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class AvailabilityController extends Controller
{
    /**
     * Get all booked dates
     */
    public function getBookedDates()
    {
        $bookedOrders = Order::where('status', '!=', 'cancelled')
            ->whereNotNull('event_date')
            ->get(['event_date']);

        $bookedDates = $bookedOrders->pluck('event_date')
            ->map(function ($date) {
                return $date->format('Y-m-d');
            })
            ->toArray();

        return response()->json([
            'bookedDates' => $bookedDates
        ]);
    }

    /**
     * Get booked dates for a specific month
     */
    public function getMonthlyAvailability(Request $request, $year, $month)
    {
        $startDate = "{$year}-{$month}-01";
        $endDate = date('Y-m-t', strtotime($startDate));

        $bookedOrders = Order::where('status', '!=', 'cancelled')
            ->whereNotNull('event_date')
            ->whereBetween('event_date', [$startDate, $endDate])
            ->get(['event_date']);

        $bookedDates = $bookedOrders->pluck('event_date')
            ->map(function ($date) {
                return $date->format('Y-m-d');
            })
            ->toArray();

        return response()->json([
            'bookedDates' => $bookedDates
        ]);
    }

    public function checkDateAvailability($date)
    {
        // Check if date is already booked
        $isBooked = Order::where('status', '!=', 'cancelled')
            ->whereNotNull('event_date')
            ->whereDate('event_date', $date)
            ->exists();

        return response()->json([
            'available' => !$isBooked,
            'date' => $date
        ]);
    }
}
