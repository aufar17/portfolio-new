<?php

namespace App\Http\Controllers;

use App\Services\SkillAdminService;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    protected $service;

    public function __construct(SkillAdminService $service)
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
