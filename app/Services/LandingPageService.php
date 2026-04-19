<?php

namespace App\Services;

use App\Models\Award;
use App\Models\Education;
use App\Models\Personal;
use App\Models\Project;
use App\Models\Skill;
use App\Models\SocialMedia;
use App\Models\Work;

class LandingPageService
{
    public function getLandingPageData()
    {
        $personal = $this->getPersonalData();
        $lastRole = $this->getLastRole();
        $skills = $this->getSkills();
        $projects = $this->getProjects();
        $achievements = $this->getAchievements();
        $works = $this->getWorks();
        $educations = $this->getEducations();
        $contacts = $this->getContact();


        $data = [
            'personal' => $personal,
            'lastRole' => $lastRole,
            'skills' => $skills,
            'projects' => $projects,
            'achievements' => $achievements,
            'works' => $works,
            'educations' => $educations,
            'contacts' => $contacts
        ];

        return $data;
    }

    public function getPersonalData()
    {
        $personal = Personal::where('id', 1)->first();
        return $personal;
    }

    public function getLastRole()
    {
        $lastRole = Work::latest()->value('role');
        return $lastRole;
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
    public function getAllProjects()
    {
        $projects = Project::orderBy('created_at', 'asc')->get();
        return $projects;
    }
    public function projectDetail($slug)
    {
        $project = Project::where('slug', $slug)->first();
        return $project;
    }
    public function getAchievements()
    {
        $achievements = Award::where('status', 1)->orderBy('created_at', 'asc')->get();
        return $achievements;
    }
    public function getAllAchievements()
    {
        $achievements = Award::orderBy('created_at', 'asc')->get();
        return $achievements;
    }
    public function achievementDetail($slug)
    {
        $achievement = Award::where('slug', $slug)->first();
        return $achievement;
    }
    public function getWorks()
    {
        $works = Work::orderBy('created_at', 'desc')->get();
        return $works;
    }
    public function getEducations()
    {
        $educations = Education::orderBy('created_at', 'desc')->get();
        return $educations;
    }

    public function getContact()
    {
        $contacts = SocialMedia::get();
        return $contacts;
    }
}
