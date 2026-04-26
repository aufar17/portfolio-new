<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Award extends Model
{
    protected $table = 'awards';

    protected $fillable = [
        'title',
        'slug',
        'type',
        'status',
        'description',
        'issuer',
        'photo',
        'date',
    ];

    protected $casts = [
        'status' => 'boolean',
        'type' => 'boolean',
        'date' => 'date',
    ];

    protected $appends = [
        'date_format'
    ];

    public function getDateFormatAttribute()
    {
        return $this->date?->format('M Y');
    }
}
