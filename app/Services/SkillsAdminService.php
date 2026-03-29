<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SkillsAdminService
{
    public function validate(Request $request)
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'icon' => 'nullable|image|max:1024',
        ]);
    }

    public function create(Request $request)
    {
        $data = $this->validate($request);

        DB::beginTransaction();
        try {
            if ($request->hasFile('icon')) {
                $file = $request->file('icon');

                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();

                $fileName = Str::slug($originalName) . '.' . $extension;

                $path = $file->storeAs('skills', $fileName, 'public');

                $data['icon'] = $path;
                $data['icon_name'] = $file->getClientOriginalName();
            }

            if (!empty($data['tech'])) {
                $data['tech_list'] = array_map('trim', explode(',', $data['tech']));
            }

            $create = Skill::create($data);

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
        $skill = Skill::findOrFail($id);

        $data = $this->validate($request);

        DB::beginTransaction();
        try {
            if ($request->hasFile('icon')) {

                if ($skill->icon && Storage::disk('public')->exists($skill->icon)) {
                    Storage::disk('public')->delete($skill->icon);
                }

                $file = $request->file('icon');

                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();

                $fileName = Str::slug($originalName) . '.' . $extension;

                $path = $file->storeAs('skills', $fileName, 'public');

                $data['icon'] = $path;
                $data['icon_name'] = $file->getClientOriginalName();
            }

            if (!empty($data['tech'])) {
                $data['tech_list'] = array_map('trim', explode(',', $data['tech']));
            }

            $skill->update($data);

            DB::commit();
            return $skill;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        $skill = Skill::findOrFail($id);

        DB::beginTransaction();
        try {
            if ($skill->icon && Storage::disk('public')->exists($skill->icon)) {
                Storage::disk('public')->delete($skill->icon);
            }
            $delete = $skill->delete();
            DB::commit();
            return $delete;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
