<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Popust extends Model
{
    use HasFactory;
    protected $table='popusti';
    protected $fillable = [
        'aktivan',
        'tip',
        'procenat',
        'danOd',
        'mesecOd',
        'danDo',
        'mesecDo'
    ];

    protected $casts = [
        'aktivan'=>'boolean'
    ];

    public function porudzbine(){
        return $this->hasMany(Porudzbina::class,'popust_id');
    }
}
