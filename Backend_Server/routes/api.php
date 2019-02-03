<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('guest:api')->get("/newNote", function(Request $request) {

    // Generate two strings, one the public note id, one a private token for edit perms
    $noteKey = substr(str_shuffle(MD5(microtime())), 0, 5);
    $noteToken = substr(str_shuffle(MD5(microtime())), 0, 15);

    // Store the key and the token for auth later
    DB::insert("INSERT INTO Notes (noteKey, noteToken) VALUES (?, ?)",
                [$noteKey, $noteToken]);

    // Return values
    return [
        "NoteKey" => $noteKey,
        "NoteToken" => $noteToken
    ];
});

Route::middleware("guest:api")->get("/readNote", function(Request $request) {
   $key = $request->get("NoteKey");

   if(preg_match("/[A-Za-z0-9]+/", $key)
      && Storage::exists("notes/$key.txt")) {

       $content = Storage::get("notes/$key.txt");

       return [
           "Status" => 0,
           "Name" => "ASFD",
           "Content" => $content
       ];
   }

   return [
       "Status" => 1,
       "Error" => "Invalid key"
   ];
});

Route::middleware("guest:api")->post("/saveNote", function(Request $request) {
    $json = $request->json()->all();
    $noteKey = $json["NoteKey"];
    $noteToken = $json["NoteToken"];
    $content = $json["Content"];

    Storage::put("notes/$noteKey.txt", $content);

    //TODO: check that the params are valid, nk exists and nt is its token

//    return [
//        "Name" => "TestNote",
//        "Age" => 0,
//        "Content" => "ASDFSADF\nASDFASDF\nASDFASDF"
//    ];

    return "";
});
