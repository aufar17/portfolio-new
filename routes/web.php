<?php

use App\Http\Controllers\MainController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SkillController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'Welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::get('landing-page', [MainController::class, 'landingPage'])->name('landing-page');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [MainController::class, 'dashboard'])->name('dashboard');
    Route::get('projects-admin', [MainController::class, 'projectsAdmin'])->name('projects-admin');
    Route::get('skills-admin', [MainController::class, 'skillsAdmin'])->name('skills-admin');


    //Projects Admin
    Route::post('create-project', [ProjectController::class, 'create'])->name('create-project');
    Route::put('update-project/{id}', [ProjectController::class, 'update'])->name('update-project');
    Route::delete('delete-project/{id}', [ProjectController::class, 'delete'])->name('delete-project');
    Route::put('update-status/{id}', [ProjectController::class, 'updateStatus'])->name('update-status');

    //Projects Admin
    Route::post('create-skill', [SkillController::class, 'create'])->name('create-skill');
    Route::put('update-skill/{id}', [SkillController::class, 'update'])->name('update-skill');
    Route::delete('delete-skill/{id}', [SkillController::class, 'delete'])->name('delete-skill');
});

require __DIR__ . '/settings.php';
