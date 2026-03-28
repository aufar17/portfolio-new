<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Skill;
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
        $projects = Project::orderBy('created_at', 'asc')->paginate(10);
        $data = [
            'projects' => $projects
        ];
        return Inertia::render('ProjectsAdmin', $data);
    }
    public function skillsAdmin()
    {
        $skills = Skill::orderBy('created_at', 'asc')->paginate(10);
        $data = [
            'skills' => $skills
        ];
        return Inertia::render('SkillsAdmin', $data);
    }
}
