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
    public function allProjects()
    {
        $projects = $this->service->getAllProjects();
        $data = [
            'projects' => $projects
        ];
        return Inertia::render('AllProject', $data);
    }
    public function projectDetail($slug)
    {
        $project = $this->service->projectDetail($slug);
        $data = [
            'project' => $project
        ];
        return Inertia::render('ProjectDetail', $data);
    }
    public function allAchievements()
    {
        $achievements = $this->service->getAllAchievements();
        $data = [
            'achievements' => $achievements
        ];
        return Inertia::render('AllAchievements', $data);
    }
    public function achievementDetail($slug)
    {
        $achievement = $this->service->achievementDetail($slug);
        $data = [
            'achievement' => $achievement
        ];
        return Inertia::render('AchievementDetail', $data);
    }
}
