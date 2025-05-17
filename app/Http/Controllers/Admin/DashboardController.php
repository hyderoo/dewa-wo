<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Catalog;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with analytics data.
     */
    public function index(Request $request)
    {
        // Get time range from request (default to 30 days)
        $timeRange = $request->input('timeRange', '1M');

        // Determine start date based on timeRange
        $startDate = $this->getStartDate($timeRange);

        // Get analytics data
        $analyticsData = [
            'revenue' => $this->getRevenueData($startDate),
            'orders' => $this->getOrdersData($startDate),
            'packages' => $this->getPackagesData($startDate),
            'recentOrders' => $this->getRecentOrders(),
            'calendar' => $this->getCalendarData(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'analyticsData' => $analyticsData,
            'timeRange' => $timeRange
        ]);
    }

    /**
     * Get start date based on time range
     */
    private function getStartDate($timeRange)
    {
        switch ($timeRange) {
            case '7D':
                return Carbon::now()->subDays(7);
            case '1M':
                return Carbon::now()->subDays(30);
            case '3M':
                return Carbon::now()->subMonths(3);
            case '1Y':
                return Carbon::now()->subYear();
            default:
                return Carbon::now()->subDays(30);
        }
    }

    /**
     * Get revenue data
     */
    private function getRevenueData($startDate)
    {
        // Get verified payments
        $payments = Payment::where('status', 'verified')
            ->where('created_at', '>=', $startDate)
            ->get();

        // Calculate total revenue
        $totalRevenue = $payments->sum('amount');

        // Calculate last month's revenue
        $lastMonthStart = Carbon::now()->startOfMonth();
        $lastMonthRevenue = Payment::where('status', 'verified')
            ->where('created_at', '>=', $lastMonthStart)
            ->sum('amount');

        // Calculate growth (compare with previous period)
        $previousPeriodStart = Carbon::parse($startDate)->subDays(Carbon::parse($startDate)->diffInDays(Carbon::now()));
        $previousPeriodRevenue = Payment::where('status', 'verified')
            ->whereBetween('created_at', [$previousPeriodStart, $startDate])
            ->sum('amount');

        $growth = $previousPeriodRevenue > 0
            ? round(($totalRevenue - $previousPeriodRevenue) / $previousPeriodRevenue * 100, 1)
            : 0;

        // Get monthly data for chart (using revenue, not order counts)
        $monthlyData = Payment::where('status', 'verified')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->select(
                DB::raw("MONTH(created_at) as month_num"),
                DB::raw("YEAR(created_at) as year"),
                DB::raw("SUM(amount) as revenue")
            )
            ->groupBy('year', 'month_num')
            ->orderBy('year')
            ->orderBy('month_num')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::createFromDate($item->year, $item->month_num, 1)->format('F'),
                    'value' => $item->revenue // Renamed to 'value' to match chart expectations
                ];
            });

        return [
            'total' => $totalRevenue,
            'growth' => $growth,
            'lastMonth' => $lastMonthRevenue,
            'monthly' => $monthlyData
        ];
    }

    /**
     * Get orders data
     */
    private function getOrdersData($startDate)
    {
        // Get total orders
        $totalOrders = Order::where('created_at', '>=', $startDate)->count();

        // Get active and completed orders count
        $activeOrders = Order::whereIn('status', ['pending_payment', 'ongoing'])
            ->where('created_at', '>=', $startDate)
            ->count();
        $completedOrders = Order::where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->count();

        // Get monthly data for chart (now with proper format)
        $monthlyData = Order::where('created_at', '>=', Carbon::now()->subMonths(6))
            ->select(
                DB::raw("MONTH(created_at) as month_num"),
                DB::raw("YEAR(created_at) as year"),
                DB::raw("COUNT(*) as orders")
            )
            ->groupBy('year', 'month_num')
            ->orderBy('year')
            ->orderBy('month_num')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::createFromDate($item->year, $item->month_num, 1)->format('F'),
                    'value' => $item->orders // Renamed to 'value' to match chart expectations
                ];
            });

        return [
            'total' => $totalOrders,
            'active' => $activeOrders,
            'completed' => $completedOrders,
            'monthly' => $monthlyData
        ];
    }

    /**
     * Get packages (catalogs) data
     */
    private function getPackagesData($startDate)
    {
        // Get all catalogs
        $catalogs = Catalog::all();

        $packagesData = [];

        foreach ($catalogs as $catalog) {
            // Count bookings/orders for this catalog
            $bookings = Order::where('catalog_id', $catalog->id)
                ->where('created_at', '>=', $startDate)
                ->count();

            // Calculate revenue from orders with this catalog
            $revenue = Order::where('catalog_id', $catalog->id)
                ->where('created_at', '>=', $startDate)
                ->sum('price');

            // Calculate average price
            $averagePrice = $bookings > 0 ? $revenue / $bookings : 0;

            // Add to packages data if there are bookings
            if ($bookings > 0) {
                $packagesData[] = [
                    'name' => $catalog->name,
                    'bookings' => $bookings,
                    'revenue' => $revenue,
                    'averagePrice' => $averagePrice
                ];
            }
        }

        // Sort packages by bookings (descending)
        usort($packagesData, function ($a, $b) {
            return $b['bookings'] - $a['bookings'];
        });

        return $packagesData;
    }

    /**
     * Get calendar data for the booking calendar
     */
    private function getCalendarData()
    {
        // Get all orders with event dates, including client, venue, and status info
        $upcomingEvents = Order::where('event_date', '>=', Carbon::now())
            ->whereIn('status', ['ongoing', 'completed', 'pending_payment'])
            ->select('id', 'order_number', 'client_name', 'venue', 'event_date', 'status')
            ->orderBy('event_date')
            ->get();

        // Format data for the calendar
        $bookedDates = $upcomingEvents->map(function ($order) {
            return [
                'date' => $order->event_date->format('Y-m-d'),
                'orderNumber' => $order->order_number,
                'client' => $order->client_name,
                'venue' => $order->venue,
                'status' => $this->getStatusDisplay($order->status),
                'statusColor' => $this->getStatusColor($order->status),
                'id' => $order->id
            ];
        });

        // Get available dates (next 3 months, excluding booked dates)
        $startDate = Carbon::now();
        $endDate = Carbon::now()->addMonths(3);

        $bookedDateStrings = $bookedDates->pluck('date')->toArray();

        // Return calendar data
        return [
            'bookedDates' => $bookedDates,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
        ];
    }

    /**
     * Get recent orders
     */
    private function getRecentOrders()
    {
        $recentOrders = Order::with('catalog')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return $recentOrders->map(function ($order) {
            return [
                'id' => $order->order_number,
                'client' => $order->client_name,
                'package' => $order->catalog ? $order->catalog->name : 'Custom Package',
                'date' => $order->event_date->format('Y-m-d'),
                'status' => $this->getStatusDisplay($order->status),
                'amount' => $order->price
            ];
        });
    }

    /**
     * Get display status
     */
    private function getStatusDisplay($status)
    {
        switch ($status) {
            case 'completed':
                return 'Completed';
            case 'ongoing':
                return 'Active';
            case 'pending_payment':
                return 'Pending';
            case 'cancelled':
                return 'Cancelled';
            default:
                return $status;
        }
    }

    /**
     * Get status color for calendar display
     */
    private function getStatusColor($status)
    {
        switch ($status) {
            case 'completed':
                return 'green';
            case 'ongoing':
                return 'blue';
            case 'pending_payment':
                return 'yellow';
            case 'cancelled':
                return 'red';
            default:
                return 'gray';
        }
    }

    /**
     * Calculate conversion rate (estimate based on completed vs total orders)
     */
    private function getConversionRate()
    {
        $totalOrders = Order::count();
        $completedOrders = Order::where('status', 'completed')->count();

        return $totalOrders > 0 ? round(($completedOrders / $totalOrders) * 100) : 0;
    }
}
