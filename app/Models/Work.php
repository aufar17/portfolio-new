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

    protected $appends = [
        'start_month',
        'end_month',
        'date_range',
    ];


    public function getStartMonthAttribute(): ?string
    {
        if (!$this->start) {
            return null;
        }

        return Carbon::createFromFormat('Y-m', $this->start)
            ->translatedFormat('M Y');
    }

    public function getEndMonthAttribute(): ?string
    {
        if (!$this->end) {
            return null;
        }

        return Carbon::createFromFormat('Y-m', $this->end)
            ->translatedFormat('M Y');
    }

    public function getDateRangeAttribute(): string
    {
        if (!$this->start) {
            return '-';
        }

        if (!$this->end) {
            return $this->start_month . ' — Present';
        }

        return $this->start_month . ' — ' . $this->end_month;
    }
}
