import type { Principal } from '@dfinity/principal';
export type AssetRequest = {
    'Put' : {
      'key' : string,
      'contentType' : string,
      'callback' : [] | [Callback],
      'payload' : { 'StagedData' : null } |
        { 'Payload' : Array<number> },
    }
  } |
  { 'Remove' : { 'key' : string, 'callback' : [] | [Callback] } } |
  { 'StagedWrite' : WriteAsset };
export type Callback = () => Promise<undefined>;
export type Error = { 'Immutable' : null } |
  { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'InvalidRequest' : null } |
  { 'AuthorizedPrincipalLimitReached' : bigint } |
  { 'FailedToWrite' : string };
export interface Hub {
  'assetRequest' : (arg_0: AssetRequest) => Promise<Result>,
  'listAssets' : () => Promise<Array<[string, string, bigint]>>,
  'staticStreamingCallback' : (arg_0: StreamingCallbackToken) => Promise<
      StreamingCallbackResponse
    >,
}
export type Result = { 'ok' : null } |
  { 'err' : Error };
export interface StreamingCallbackResponse {
  'token' : [] | [StreamingCallbackToken],
  'body' : Array<number>,
}
export interface StreamingCallbackToken {
  'key' : string,
  'index' : bigint,
  'content_encoding' : string,
}
export type WriteAsset = {
    'Init' : { 'id' : string, 'size' : bigint, 'callback' : [] | [Callback] }
  } |
  {
    'Chunk' : {
      'id' : string,
      'chunk' : Array<number>,
      'callback' : [] | [Callback],
    }
  };
export interface _SERVICE extends Hub {}
