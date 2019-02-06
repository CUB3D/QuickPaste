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
    $noteToken = str_shuffle(MD5(microtime()));
    $noteFile = str_shuffle(MD5(microtime()));


    // Store the key and the token for auth later
    DB::insert("INSERT INTO Notes (
                   noteKey,
                   noteToken,
                   noteFile,
                   creationTime) VALUES (?, ?, ?, ?)",
                [$noteKey, $noteToken, $noteFile, microtime()]);

    // Create the file
    Storage::put("notes/$noteFile.txt", "");

    // Return values
    return [
        "NoteKey" => $noteKey,
        "NoteToken" => $noteToken
    ];
});

Route::middleware("guest:api")->get("/readNote", function(Request $request) {
   $key = $request->get("NoteKey");

   $query = DB::table("NOTES")->where("noteKey", $key);

   if($query->exists()) {
       $fileName = $query->first()->noteFile;
       $content = Storage::get("notes/$fileName.txt");

       return [
           "Status" => 0,
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

    //Check that key is valid and exists in db
    $queryResp = DB::table("NOTES")->where("noteKey", $noteKey);

    if($queryResp->exists()) { // Key is valid, check token
        $noteData = $queryResp->first();
        $dbToken = $noteData->noteToken;

        if ($dbToken === $noteToken) {
            // Get the file name
            $dbFile = $noteData->noteFile;

            Storage::put("notes/$dbFile.txt", $content);

            return [
                "Status" => 0
            ];
        }
    }
    // Either key is invalid or the token is wrong, don't indicate which

    return [
        "Status" => 1
    ];
});
