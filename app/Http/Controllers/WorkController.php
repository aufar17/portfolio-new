<?php

namespace App\Http\Controllers;

use App\Services\WorksAdminService;
use Illuminate\Http\Request;

class WorkController extends Controller
{
    protected $service;

    public function __construct(WorksAdminService $service)
    {
        $this->service = $service;
    }
    public function create(Request $request,)
    {
        $this->service->create($request);
        return back()->with('success', 'Education created successfully');
    }
    public function update(Request $request, $id)
    {
        $this->service->update($request, $id);
        return back()->with('success', 'Education updated successfully');
    }
    public function delete($id)
    {
        $this->service->delete($id);
        return back()->with('success', 'Education deleted successfully');
    }
}
