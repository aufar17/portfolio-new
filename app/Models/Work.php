<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Work extends Model
{
    protected $table = 'works';
    protected $fillable = [
        'company',
        'role',
        'status',
        'desc',
        'start',
        'end'
    ];

    public function getStartMonthAttribute(): string
    {
        return Carbon::parse($this->start)->format('d M Y');
    }

    public function getEndMonthAttribute(): string
    {
        return Carbon::parse($this->end)->format('d M Y');
    }

    public function getDateRangeAttribute(): string
    {
        if (!$this->end) {
            return $this->start_month . ' — Present';
        }

        return $this->start_month . ' — ' . $this->end_month;
    }
}
