<?php

use App\Http\Controllers\AwardController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\MainController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\WorkController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'Welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::get('landing-page', [LandingPageController::class, 'landingPage'])->name('landing-page');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [MainController::class, 'dashboard'])->name('dashboard');
    Route::get('projects-admin', [MainController::class, 'projectsAdmin'])->name('projects-admin');
    Route::get('skills-admin', [MainController::class, 'skillsAdmin'])->name('skills-admin');
    Route::get('awards-admin', [MainController::class, 'awardsAdmin'])->name('awards-admin');
    Route::get('educations-admin', [MainController::class, 'educationsAdmin'])->name('educations-admin');
    Route::get('works-admin', [MainController::class, 'worksAdmin'])->name('works-admin');


    //Projects Admin
    Route::post('create-project', [ProjectController::class, 'create'])->name('create-project');
    Route::put('update-project/{id}', [ProjectController::class, 'update'])->name('update-project');
    Route::delete('delete-project/{id}', [ProjectController::class, 'delete'])->name('delete-project');
    Route::put('update-status/{id}', [ProjectController::class, 'updateStatus'])->name('update-status');

    //Skills Admin
    Route::post('create-skill', [SkillController::class, 'create'])->name('create-skill');
    Route::put('update-skill/{id}', [SkillController::class, 'update'])->name('update-skill');
    Route::delete('delete-skill/{id}', [SkillController::class, 'delete'])->name('delete-skill');

    //Award Admin
    Route::post('create-award', [AwardController::class, 'create'])->name('create-award');
    Route::put('update-award/{id}', [AwardController::class, 'update'])->name('update-award');
    Route::delete('delete-award/{id}', [AwardController::class, 'delete'])->name('delete-award');

    //Education Admin
    Route::post('create-education', [EducationController::class, 'create'])->name('create-education');
    Route::put('update-education/{id}', [EducationController::class, 'update'])->name('update-education');
    Route::delete('delete-education/{id}', [EducationController::class, 'delete'])->name('delete-education');

    //Education Admin
    Route::post('create-work', [WorkController::class, 'create'])->name('create-work');
    Route::put('update-work/{id}', [WorkController::class, 'update'])->name('update-work');
    Route::delete('delete-work/{id}', [WorkController::class, 'delete'])->name('delete-work');
});

require __DIR__ . '/settings.php';
