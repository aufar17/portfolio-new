<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $table = 'projects';
    protected $fillable = [
        'title',
        'slug',
        'description',
        'responsibility',
        'start',
        'end',
        'status',
        'tech',
        'link',
        'associate',
        'image',
    ];

    protected $appends = [
        'start_month',
        'end_month',
        'date_range',
        'tech_list',
    ];

    public function getStartMonthAttribute(): string
    {
        return Carbon::parse($this->start)->format('M Y');
    }

    public function getEndMonthAttribute(): string
    {
        return Carbon::parse($this->end)->format('M Y');
    }

    public function getDateRangeAttribute(): string
    {
        if (!$this->end) {
            return $this->start_month . ' — Present';
        }

        return $this->start_month . ' — ' . $this->end_month;
    }

    public function getTechListAttribute(): array
    {
        if (!$this->tech) {
            return [];
        }

        return collect(explode(',', $this->tech))
            ->map(fn($item) => trim($item))
            ->filter()
            ->values()
            ->toArray();
    }
}
