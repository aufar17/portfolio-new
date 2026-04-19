<?php

namespace App\Http\Controllers;

use App\Services\AwardsAdminService;
use Illuminate\Http\Request;

class AwardController extends Controller
{
    protected $service;

    public function __construct(AwardsAdminService $service)
    {
        $this->service = $service;
    }
    public function create(Request $request,)
    {
        $this->service->create($request);
        return back()->with('success', 'Award created successfully');
    }
    public function update(Request $request, $id)
    {
        $this->service->update($request, $id);
        return back()->with('success', 'Award updated successfully');
    }
    public function delete($id)
    {
        $this->service->delete($id);
        return back()->with('success', 'Award deleted successfully');
    }
    public function updateStatus(Request $request, $id)
    {
        $this->service->updateStatusAward($request, $id);
        return back()->with('success', 'Award updated status successfully');
    }
}
