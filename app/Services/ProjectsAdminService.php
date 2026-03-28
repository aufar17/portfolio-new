<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProjectsAdminService
{
    public function validate(Request $request)
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'responsibility' => 'nullable|string',
            'start' => 'nullable|date',
            'end' => 'nullable|date',
            'tech' => 'nullable|string',
            'link' => 'nullable|string',
            'associate' => 'nullable|string',
            'image' => 'nullable|image|max:1024',
        ]);
    }

    public function create(Request $request)
    {
        $data = $this->validate($request);

        DB::beginTransaction();
        try {
            if ($request->hasFile('image')) {
                $file = $request->file('image');

                $path = $file->store('projects', 'public');

                $data['image'] = $path;
                $data['image_name'] = $file->getClientOriginalName();
            }

            if (!empty($data['tech'])) {
                $data['tech_list'] = explode(',', $data['tech']);
            }
            $create = Project::create($data);
            DB::commit();
            return $create;
        } catch (\Exception $e) {
            DB::rollBack();
            if (isset($path) && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $data = $this->validate($request);

        DB::beginTransaction();
        try {
            if ($request->hasFile('image')) {

                if ($project->image && Storage::disk('public')->exists($project->image)) {
                    Storage::disk('public')->delete($project->image);
                }

                $file = $request->file('image');
                $path = $file->store('projects', 'public');

                $data['image'] = $path;
                $data['image_name'] = $file->getClientOriginalName();
            }

            if (!empty($data['tech'])) {
                $data['tech_list'] = array_map('trim', explode(',', $data['tech']));
            }

            $project->update($data);

            DB::commit();
            return $project;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        $project = Project::findOrFail($id);

        DB::beginTransaction();
        try {
            if ($project->image && Storage::disk('public')->exists($project->image)) {
                Storage::disk('public')->delete($project->image);
            }
            $delete = $project->delete();
            DB::commit();
            return $delete;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
