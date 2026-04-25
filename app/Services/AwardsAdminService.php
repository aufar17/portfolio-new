<?php

namespace App\Services;

use App\Models\Award;
use App\Models\Project;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AwardsAdminService
{
    public function validate(Request $request)
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|integer',
            'description' => 'required|string',
            'issuer' => 'required|string|max:255',
            'date' => 'required|date',
            'photo' => 'nullable|image|max:1024',
        ]);
    }

    public function create(Request $request)
    {
        $data = $this->validate($request);

        DB::beginTransaction();
        try {
            if ($request->hasFile('photo')) {
                $file = $request->file('photo');

                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();

                $fileName = Str::slug($originalName) . '.' . $extension;

                $path = $file->storeAs('awards', $fileName, 'public');

                $data['photo'] = $path;
                $data['photo_name'] = $file->getClientOriginalName();
            }
            if (!empty($data['title'])) {
                $baseSlug = Str::slug($data['title']);
                $slug = $baseSlug;
                $counter = 1;

                while (Award::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter++;
                }

                $data['slug'] = $slug;
            }
            $data['status'] = 0;
            $create = Award::create($data);

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
        $award = Award::findOrFail($id);

        $data = $this->validate($request);

        DB::beginTransaction();
        try {
            if ($request->hasFile('photo')) {

                if ($award->photo && Storage::disk('public')->exists($award->photo)) {
                    Storage::disk('public')->delete($award->photo);
                }

                $file = $request->file('photo');

                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();

                $fileName = Str::slug($originalName) . '.' . $extension;

                $path = $file->storeAs('awards', $fileName, 'public');

                $data['photo'] = $path;
                $data['photo_name'] = $file->getClientOriginalName();
            } else {
                $data['photo'] = $award->photo;
                $data['photo_name'] = $award->photo_name;
            }

            if (!empty($data['title'])) {
                $baseSlug = Str::slug($data['title']);
                $slug = $baseSlug;
                $counter = 1;

                $exist =    Award::where('slug', $slug)
                    ->where('id', '!=', $award->id)
                    ->exists();

                while ($exist) {
                    $slug = $baseSlug . '-' . $counter++;
                }

                $data['slug'] = $slug;
            }
            $award->update($data);

            DB::commit();
            return $award;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        $award = Award::findOrFail($id);

        DB::beginTransaction();
        try {
            if ($award->photo && Storage::disk('public')->exists($award->photo)) {
                Storage::disk('public')->delete($award->photo);
            }
            $delete = $award->delete();
            DB::commit();
            return $delete;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateStatusAward(Request $request, $id)
    {
        $award = Award::findOrFail($id);

        DB::beginTransaction();
        try {
            $status = $award->update([
                'status' => $request->status
            ]);
            DB::commit();
            return $status;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
