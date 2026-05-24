<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only Documents feed for staff mobile (Module #6).
 *
 * Mirrors the data of System\DocumentController@index. Documents are polymorphic
 * (attached to a Trip, Vehicle or Driver via `documentable`); there is no
 * standalone type/expiry column, so "type" is the related entity kind and the
 * related-entity name is flattened inline for the list.
 */
class DocumentController extends Controller
{
    // Friendly type key ⇄ model class, used for filtering and labelling.
    private static array $typeMap = [
        'trip'    => Trip::class,
        'vehicle' => Vehicle::class,
        'driver'  => Driver::class,
    ];

    // GET /api/staff/modules/documents — newest first, optional ?search / ?type.
    public function index(Request $request): JsonResponse
    {
        $query = Document::with('documentable')->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('file_name', 'like', "%{$s}%");
            });
        }

        if ($request->filled('type') && isset(self::$typeMap[$request->type])) {
            $query->where('documentable_type', self::$typeMap[$request->type]);
        }

        $documents = $query->paginate(50)->withQueryString();

        $documents->getCollection()->transform(fn (Document $doc) => $this->transform($doc));

        return response()->json([
            'documents' => $documents,
        ]);
    }

    // Flatten a Document into the shape the mobile screen consumes.
    private function transform(Document $doc): array
    {
        return [
            'id'             => $doc->id,
            'title'          => $doc->title,
            'type'           => $this->typeKey($doc->documentable_type),
            'related_type'   => $this->typeKey($doc->documentable_type),
            'related_id'     => $doc->documentable_id,
            'related_name'   => $this->relatedName($doc),
            'file_name'      => $doc->file_name,
            'file_path'      => $doc->file_path,
            'file_url'       => $this->fileUrl($doc),
            'mime_type'      => $doc->mime_type,
            'file_size'      => $doc->file_size,
            'file_size_human' => $doc->file_size_human,
            'notes'          => $doc->notes,
            'uploaded_at'    => $doc->created_at?->toIso8601String(),
        ];
    }

    // Map a fully-qualified documentable class to its friendly key (trip/vehicle/driver).
    private function typeKey(?string $class): ?string
    {
        return array_search($class, self::$typeMap, true) ?: null;
    }

    // Human label for the related entity (plate, name, trip number, …).
    private function relatedName(Document $doc): ?string
    {
        $related = $doc->documentable;
        if (! $related) {
            return null;
        }

        return $related->plate
            ?? $related->trip_number
            ?? $related->name
            ?? ('#' . $doc->documentable_id);
    }

    // Absolute URL the file can be downloaded from (named web download route).
    private function fileUrl(Document $doc): ?string
    {
        if (! $doc->file_path) {
            return null;
        }

        return route('system.documents.download', $doc->id);
    }
}
