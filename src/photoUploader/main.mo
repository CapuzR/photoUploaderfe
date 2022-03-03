import Blob "mo:base/Blob";
import Http "http";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Static "static";
import Text "mo:base/Text";
import Types "types";
import Debug "mo:base/Debug";

shared({ caller = hub }) actor class Hub() = this {

    stable var staticAssetsEntries : [(
        Text,        // Asset Identifier (path).
        Static.Asset // Asset data.
    )] = [];
    let staticAssets = Static.Assets(staticAssetsEntries);
    
    // List all static assets.
    // @pre: isOwner
    public query ({caller}) func listAssets() : async [(Text, Text, Nat)] {
        // assert(_isOwner(caller));
        staticAssets.list();
    };

    // Putting and initializing staged data will overwrite the present data.
    public shared ({caller}) func assetRequest(data : Static.AssetRequest) : async Result.Result<(), Types.Error> {
        // assert(_isOwner(caller));
        
        switch(data){
            case(#StagedWrite(_)) { };
            case(#Remove(_)) { };
            case( #Put(lol) ) { 
                switch(lol.payload){
                    case(#Payload(aja)) {
                        Debug.print(debug_show(aja)); 
                    };
                    case(#StagedData(_)) {};
                };
        };
        };
        switch (await staticAssets.handleRequest(data)) {
            case (#ok())   { #ok(); };
            case (#err(e)) { #err(#FailedToWrite(e)); };
        };
    };

    // A streaming callback based on static assets.
    // Returns {[], null} if the asset can not be found.
    public query func staticStreamingCallback(tk : Http.StreamingCallbackToken) : async Http.StreamingCallbackResponse {
        switch(staticAssets.getToken(tk.key)) {
            case (#err(_)) { };
            case (#ok(v))  {
                return Http.streamContent(
                    tk.key,
                    tk.index,
                    v.payload,
                );
            };
        };
        {
            body = Blob.fromArray([]);
            token = null;
        };
    };

};
