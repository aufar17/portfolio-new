<?php

namespace App\Services;

use App\Models\Education;
use App\Models\Work;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorksAdminService
{
    public function validate(Request $request)
    {
        return $request->validate([
            'company' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'status' => 'required|string|max:255',
            'desc' => 'required|string',
            'start' => 'required|date',
            'end' => 'required|date',
        ]);
    }

    public function create(Request $request)
    {
        $data = $this->validate($request);
        $data['start'] = date('Y', strtotime($data['start']));
        $data['end']   = date('Y', strtotime($data['end']));

        DB::beginTransaction();
        try {
            $create = Work::create($data);

            DB::commit();
            return $create;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $work = Work::findOrFail($id);
        $data = $this->validate($request);
        $data['end']   = date('Y', strtotime($data['end']));
        $data['start'] = date('Y', strtotime($data['start']));

        DB::beginTransaction();
        try {
            $work->update($data);

            DB::commit();
            return $work;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        $work = Work::findOrFail($id);

        DB::beginTransaction();
        try {
            $delete = $work->delete();
            DB::commit();
            return $delete;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
