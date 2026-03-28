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
        return back()->with('success', 'Project created successfully');
    }
    public function update(Request $request, $id)
    {
        $this->service->update($request, $id);
        return back()->with('success', 'Project updated successfully');
    }
    public function delete($id)
    {
        $this->service->delete($id);
        return back()->with('success', 'Project deleted successfully');
    }
}
