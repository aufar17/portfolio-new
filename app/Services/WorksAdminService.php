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
            'end' => 'nullable|date',
        ]);
    }

    public function create(Request $request)
    {
        $data = $this->validate($request);

        $data['start'] = !empty($data['start'])
            ? date('Y-m', strtotime($data['start']))
            : null;

        $data['end'] = !empty($data['end'])
            ? date('Y-m', strtotime($data['end']))
            : null;

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

        $data['start'] = !empty($data['start'])
            ? date('Y-m', strtotime($data['start']))
            : null;

        $data['end'] = !empty($data['end'])
            ? date('Y-m', strtotime($data['end']))
            : null;

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
