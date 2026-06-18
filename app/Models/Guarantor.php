<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guarantor extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id', 'name', 'phone', 'address',
        'id_type', 'id_number', 'id_doc_path', 'letter_doc_path',
        'owns_house', 'house_address',
    ];

    protected $casts = [
        'owns_house' => 'boolean',
    ];

    // Expose ready-to-use public URLs for the uploaded files, mirroring Driver::photo_url.
    protected $appends = ['id_doc_url', 'letter_doc_url'];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function getIdDocUrlAttribute(): ?string
    {
        return $this->id_doc_path ? '/storage/' . ltrim($this->id_doc_path, '/') : null;
    }

    public function getLetterDocUrlAttribute(): ?string
    {
        return $this->letter_doc_path ? '/storage/' . ltrim($this->letter_doc_path, '/') : null;
    }

    // A driver may register up to this many guarantors.
    public static int $maxPerDriver = 6;

    // The single accepted identity document types.
    public static array $idTypes = [
        'nida'        => 'NIDA (National ID)',
        'voters_card' => "Voter's Card (Kadi ya Kura)",
    ];
}