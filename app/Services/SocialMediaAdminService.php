<?php

namespace App\Services;

use App\Models\Education;
use App\Models\SocialMedia;
use App\Models\Work;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SocialMediaAdminService
{
    public function validate(Request $request)
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'link' => 'required|string|max:255',
            'color' => 'required|string|max:255',
            'icon' => 'required|string',
        ]);
    }

    public function create(Request $request)
    {
        $data = $this->validate($request);

        DB::beginTransaction();
        try {
            $create = SocialMedia::create($data);

            DB::commit();
            return $create;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $social = SocialMedia::findOrFail($id);
        $data = $this->validate($request);
        DB::beginTransaction();
        try {
            $social->update($data);

            DB::commit();
            return $social;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        $social = SocialMedia::findOrFail($id);

        DB::beginTransaction();
        try {
            $delete = $social->delete();
            DB::commit();
            return $delete;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
