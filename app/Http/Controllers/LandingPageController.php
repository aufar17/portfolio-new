<?php

namespace App\Http\Controllers;

use App\Services\LandingPageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    private $service;
    public function __construct(LandingPageService $service)
    {
        $this->service = $service;
    }
    public function landingPage()
    {
        $data = $this->service->getLandingPageData();
        return Inertia::render('LandingPage', $data);
    }
}
