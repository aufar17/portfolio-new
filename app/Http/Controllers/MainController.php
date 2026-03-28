<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MainController extends Controller
{
    public function landingPage()
    {
        return Inertia::render('LandingPage');
    }
    public function dashboard()
    {
        return Inertia::render('Dashboard');
    }
    public function projectsAdmin()
    {
        $projects = Project::orderBy('created_at', 'desc')->paginate(10);
        $data = [
            'projects' => $projects
        ];
        return Inertia::render('ProjectsAdmin', $data);
    }
}
