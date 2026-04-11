<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Personal extends Model
{
    protected $table = 'personals';

    protected $fillable = [
        'desc',
        'role',
        'about',
        'photo',
    ];

    protected $appends = [
        'role_list',
    ];

    public function getRoleListAttribute(): array
    {
        if (!$this->role) {
            return [];
        }

        return collect(explode(',', $this->role))
            ->map(fn($item) => trim($item))
            ->filter()
            ->values()
            ->toArray();
    }
}
