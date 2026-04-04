<?php

namespace App\Services;

use App\Models\Award;
use App\Models\Education;
use App\Models\Project;
use App\Models\Skill;
use App\Models\Work;

class LandingPageService
{
    public function getLandingPageData()
    {
        $skills = $this->getSkills();
        $projects = $this->getProjects();
        $works = $this->getWorks();
        $educations = $this->getEducations();

        $data = [
            'skills' => $skills,
            'projects' => $projects,
            'works' => $works,
            'educations' => $educations,
        ];

        return $data;
    }
    public function getSkills()
    {
        $hardSkills = Skill::where('type', 1)->orderBy('created_at', 'asc')->get();
        $softSkills = Skill::where('type', 2)->orderBy('created_at', 'asc')->get();
        $data = [
            'hardSkills' => $hardSkills,
            'softSkills' => $softSkills
        ];
        return $data;
    }

    public function getProjects()
    {
        $projects = Project::where('status', 1)->orderBy('created_at', 'asc')->get();
        return $projects;
    }
    public function getWorks()
    {
        $works = Work::orderBy('created_at', 'asc')->get();
        return $works;
    }
    public function getEducations()
    {
        $educations = Education::orderBy('created_at', 'asc')->get();
        return $educations;
    }
}
