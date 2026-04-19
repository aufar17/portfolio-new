<?php

namespace App\Services;

use App\Models\Education;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EducationsAdminService
{
    public function validate(Request $request)
    {
        return $request->validate([
            'institution' => 'required|string|max:255',
            'major' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'start' => 'required|date',
            'end' => 'nullable|date',
        ]);
    }

    public function create(Request $request)
    {
        $data = $this->validate($request);
        $data['start'] = $this->formatYear($data['start']);
        $data['end'] = $this->formatYear($data['end']);
        DB::beginTransaction();
        try {
            $create = Education::create($data);

            DB::commit();
            return $create;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $education = Education::findOrFail($id);
        $data = $this->validate($request);
        $data['start'] = $this->formatYear($data['start']);
        $data['end'] = $this->formatYear($data['end']);
        DB::beginTransaction();
        try {
            $education->update($data);

            DB::commit();
            return $education;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        $education = Education::findOrFail($id);

        DB::beginTransaction();
        try {
            $delete = $education->delete();
            DB::commit();
            return $delete;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function formatYear($date)
    {
        return $date ? date('Y', strtotime($date)) : null;
    }
}
