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

    protected $casts = [
        'start' => 'date',
        'end'   => 'date',
    ];

    protected $appends = [
        'description',
        'start_month',
        'end_month',
        'date_range',
    ];

    public function getDescriptionAttribute(): ?string
    {
        return $this->desc;
    }

    public function getStartMonthAttribute(): ?string
    {
        return $this->start
            ? Carbon::parse($this->start)->translatedFormat('M Y')
            : null;
    }

    public function getEndMonthAttribute(): ?string
    {
        return $this->end
            ? Carbon::parse($this->end)->translatedFormat('M Y')
            : null;
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
