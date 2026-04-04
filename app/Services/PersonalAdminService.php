<?php

namespace App\Services;

use App\Models\Personal;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PersonalAdminService
{
    public function validate(Request $request)
    {
        return $request->validate([
            'desc' => 'required|string',
            'role' => 'required|string',
            'about' => 'required|string',
            'photo' => 'nullable|image',
        ]);
    }

    public function update(Request $request, $id)
    {
        $personal = Personal::findOrFail($id);

        $data = $this->validate($request);

        DB::beginTransaction();
        try {
            if ($request->hasFile('photo')) {

                if ($personal->photo && Storage::disk('public')->exists($personal->photo)) {
                    Storage::disk('public')->delete($personal->photo);
                }

                $file = $request->file('photo');
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();

                $fileName = Str::slug($originalName) . '.' . $extension;

                $path = $file->storeAs('personal', $fileName, 'public');

                $data['photo'] = $path;
                $data['photo_name'] = $file->getClientOriginalName();
            }

            if (!empty($data['role'])) {
                $data['role_list'] = array_map('trim', explode(',', $data['role']));
            }

            $personal->update($data);

            DB::commit();
            return $personal;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
