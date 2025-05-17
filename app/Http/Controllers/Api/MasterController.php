<?php

namespace App\Http\Controllers\Api;

use App\Models\Bank;
use App\Models\Service;
use App\Models\VirtualAccount;
use Illuminate\Http\Request;

class MasterController extends ApiController
{
    /**
     * Get all active banks
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function banks()
    {
        $banks = Bank::orderBy('name')->get();
        return $this->successResponse($banks);
    }

    /**
     * Get all active va
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function va()
    {
        $va = VirtualAccount::orderBy('name')->get();
        return $this->successResponse($va);
    }
}
