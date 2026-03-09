<?php

namespace App\Http\Controllers;

use App\Http\Resources\GalerijaResource;
use App\Models\Galerija;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;
// ['']  \  @
class GalerijaController extends Controller
{
    #[OA\get(
        path: '/api/galerija',
        summary: 'Vraća sve galerije',
        tags: ['Galerija'],
        responses: [
            new OA\Response(response: 200, description: 'Lista svih galerija')
        ]
    )]
    public function index()
    {
        $galerija=Galerija::first();
        return response()->json(new GalerijaResource($galerija),200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    #[OA\get(
        path: '/api/galerija/{id}',
        summary: 'Vraća jednu galeriju',
        tags: ['Galerija'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Galerija'),
            new OA\Response(response: 404, description: 'Galerija nije pronađena'),
        ]
    )]
    public function show($id)
    {
        return response()->json(new GalerijaResource(Galerija::findOrFail($id)),200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Galerija $galerija)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Galerija $galerija)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Galerija $galerija)
    {
        //
    }
}
