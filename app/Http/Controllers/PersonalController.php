<?php

namespace App\Http\Controllers;

use App\Services\PersonalAdminService;
use Illuminate\Http\Request;

class PersonalController extends Controller
{
    protected $service;

    public function __construct(PersonalAdminService $service)
    {
        $this->service = $service;
    }
    public function update(Request $request, $id)
    {
        $this->service->update($request, $id);
        return back()->with('success', 'Education updated successfully');
    }
}
