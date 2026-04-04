<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    protected $table = 'educations';
    protected $fillable =
    [
        'institution',
        'major',
        'title',
        'start',
        'end',
    ];

    protected $appends = [
        'start_month',
        'end_month',
        'date_range',
    ];

    public function getStartMonthAttribute(): ?string
    {
        return $this->start
            ? Carbon::parse($this->start)->translatedFormat('Y')
            : null;
    }

    public function getEndMonthAttribute(): ?string
    {
        return $this->end
            ? Carbon::parse($this->end)->translatedFormat('Y')
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
