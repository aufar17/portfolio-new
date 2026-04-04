<?php

namespace App\Http\Controllers;

use App\Services\SocialMediaAdminService;
use Illuminate\Http\Request;

class SocialMediaController extends Controller
{
    protected $service;

    public function __construct(SocialMediaAdminService $service)
    {
        $this->service = $service;
    }
    public function create(Request $request,)
    {
        $this->service->create($request);
        return back()->with('success', 'Social media created successfully');
    }
    public function update(Request $request, $id)
    {
        $this->service->update($request, $id);
        return back()->with('success', 'Social media updated successfully');
    }
    public function delete($id)
    {
        $this->service->delete($id);
        return back()->with('success', 'Social media deleted successfully');
    }
}
