<?php

namespace App\Http\Controllers;

use App\Models\Award;
use App\Models\Education;
use App\Models\Project;
use App\Models\Skill;
use App\Models\Work;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MainController extends Controller
{

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
    public function awardsAdmin()
    {
        $awards = Award::orderBy('created_at', 'asc')->paginate(10);
        $data = [
            'awards' => $awards
        ];
        return Inertia::render('AwardsAdmin', $data);
    }
    public function educationsAdmin()
    {
        $educations = Education::orderBy('created_at', 'asc')->paginate(10);
        $data = [
            'educations' => $educations
        ];
        return Inertia::render('EducationsAdmin', $data);
    }

    public function worksAdmin()
    {
        $works = Work::orderBy('created_at', 'asc')->paginate(10);
        $data = [
            'works' => $works
        ];
        return Inertia::render('WorksAdmin', $data);
    }
}
