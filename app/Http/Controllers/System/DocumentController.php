<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    private static array $modelMap = [
        'trip'    => Trip::class,
        'vehicle' => Vehicle::class,
        'driver'  => Driver::class,
    ];

    public function index(Request $request)
    {
        $query = Document::with('documentable')->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('file_name', 'like', "%{$s}%");
            });
        }
        if ($request->filled('type')) {
            $map = ['trip' => Trip::class, 'vehicle' => Vehicle::class, 'driver' => Driver::class];
            if (isset($map[$request->type])) {
                $query->where('documentable_type', $map[$request->type]);
            }
        }

        $documents = $query->paginate(20)->withQueryString();

        $stats = [
            'total'    => Document::count(),
            'trips'    => Document::where('documentable_type', Trip::class)->count(),
            'vehicles' => Document::where('documentable_type', Vehicle::class)->count(),
            'drivers'  => Document::where('documentable_type', Driver::class)->count(),
        ];

        return Inertia::render('system/Documents/Index', [
            'documents' => $documents,
            'stats'     => $stats,
            'filters'   => $request->only(['search', 'type']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('system/Documents/Create', [
            'trips'    => Trip::latest()->limit(60)->get(['id', 'trip_number', 'route_from', 'route_to']),
            'vehicles' => Vehicle::orderBy('plate')->get(['id', 'plate', 'make', 'model_name']),
            'drivers'  => Driver::orderBy('name')->get(['id', 'name']),
            'prefill'  => $request->only(['type', 'id']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'              => 'required|string|max:150',
            'documentable_type'  => 'required|in:trip,vehicle,driver',
            'documentable_id'    => 'required|integer',
            'file'               => 'required|file|max:20480|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx',
            'notes'              => 'nullable|string',
        ]);

        $file  = $request->file('file');
        $type  = $request->documentable_type;
        $path  = $file->store("documents/{$type}s", 'local');

        $modelClass = self::$modelMap[$type];
        $modelClass::findOrFail($request->documentable_id); // validate exists

        Document::create([
            'documentable_type' => $modelClass,
            'documentable_id'   => $request->documentable_id,
            'title'             => $request->title,
            'file_name'         => $file->getClientOriginalName(),
            'file_path'         => $path,
            'mime_type'         => $file->getMimeType(),
            'file_size'         => $file->getSize(),
            'notes'             => $request->notes,
            'created_by'        => $request->user()->id,
        ]);

        return redirect()->route('system.documents.index')
            ->with('success', 'Document uploaded.');
    }

    public function download(Document $document): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    public function destroy(Document $document)
    {
        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return back()->with('success', 'Document deleted.');
    }
}
