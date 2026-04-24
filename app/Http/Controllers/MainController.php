<?php

namespace App\Http\Controllers;

use App\Models\Award;
use App\Models\Education;
use App\Models\Personal;
use App\Models\Project;
use App\Models\Skill;
use App\Models\SocialMedia;
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
        $projects = Project::orderBy('created_at', 'asc')->get();
        $data = [
            'projects' => $projects
        ];
        return Inertia::render('ProjectsAdmin', $data);
    }
    public function skillsAdmin()
    {
        $skills = Skill::orderBy('created_at', 'asc')->get();
        $data = [
            'skills' => $skills
        ];
        return Inertia::render('SkillsAdmin', $data);
    }
    public function awardsAdmin()
    {
        $awards = Award::orderBy('created_at', 'asc')->get();
        $data = [
            'awards' => $awards
        ];
        return Inertia::render('AwardsAdmin', $data);
    }
    public function educationsAdmin()
    {
        $educations = Education::orderBy('created_at', 'asc')->get();
        $data = [
            'educations' => $educations
        ];
        return Inertia::render('EducationsAdmin', $data);
    }

    public function worksAdmin()
    {
        $works = Work::orderBy('created_at', 'asc')->get();
        $data = [
            'works' => $works
        ];
        return Inertia::render('WorksAdmin', $data);
    }
    public function personalAdmin()
    {
        $personal = Personal::where('id', 1)->first();
        $data = [
            'personal' => $personal
        ];
        return Inertia::render('PersonalAdmin', $data);
    }
    public function socialAdmin()
    {
        $social = SocialMedia::orderBy('created_at', 'asc')->get();
        $data = [
            'social' => $social
        ];
        return Inertia::render('SocialMediaAdmin', $data);
    }
}
