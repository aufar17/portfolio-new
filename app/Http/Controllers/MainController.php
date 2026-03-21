<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MainController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Dashboard');
    }
    public function landingPage()
    {
        return Inertia::render('LandingPage');
    }
}
