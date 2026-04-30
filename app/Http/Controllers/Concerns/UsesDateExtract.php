<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Support\Facades\DB;

trait UsesDateExtract
{
    protected function monthExpr(string $col): string
    {
        return DB::getDriverName() === 'sqlite'
            ? "CAST(strftime('%m', {$col}) AS INTEGER)"
            : "MONTH({$col})";
    }

    protected function yearExpr(string $col): string
    {
        return DB::getDriverName() === 'sqlite'
            ? "CAST(strftime('%Y', {$col}) AS INTEGER)"
            : "YEAR({$col})";
    }
}
