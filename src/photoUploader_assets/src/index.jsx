import { photoUploader } from "../../declarations/photoUploader";
import { idlFactory } from "../../../.dfx/local/canisters/assets";
import * as React from 'react';
import ReactDOM from 'react-dom';
import { Button, Grid, TextField } from '@mui/material';
import { useState, useEffect } from "react";
import { readAndCompressImage } from 'browser-image-resizer';
import { encode, decode } from 'uint8-to-base64';
import PlugConnect from '@psychedelic/plug-connect';
const network =
  process.env.DFX_NETWORK ||
  (process.env.NODE_ENV === "production" ? "ic" : "local");
const host = network != "ic" ? "http://localhost:8080" : "https://mainnet.dfinity.network";
const canisterId = 'rkp4c-7iaaa-aaaaa-aaaca-cai';
const whitelist = ['rkp4c-7iaaa-aaaaa-aaaca-cai'];

export default function Uploader() {
  const [image, setImage] = useState("https://via.placeholder.com/300.png/09f/fff");  
  const [ fileName, setFileName ] = useState();

  const handleShow = async (e) => {
    const assetActor = await window.ic.plug.createActor({
      canisterId: canisterId,
      interfaceFactory: idlFactory
    });

    const asset = await assetActor.get({
      key: fileName,
      accept_encodings: ["identity"]
    });
    
    const chunksQty = Math.ceil(parseInt(asset.total_length)/500000);
    let fullAsset = [];

    for (let i=0; i<chunksQty; i++) {
      const chunk = await assetActor.get_chunk({
        key: fileName,
        content_encoding: "identity",
        index: i,
        sha256: []
      });
      fullAsset = fullAsset.concat(chunk.content);
    }
    
    const encoded = encode(fullAsset);
    setImage("data:image/jpeg;base64," + encoded);
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    const assetActor = await window.ic.plug.createActor({
      canisterId: canisterId,
      interfaceFactory: idlFactory
    });
    const chunkSize = 500000;
    const clone = [...new Uint8Array(await file.arrayBuffer())];
    const batchId = await assetActor.create_batch({});
    const chunkIds = [];

    for (let i = 0; i < clone.length; i += chunkSize) {
      const chunk = clone.slice(i, i + chunkSize);
      const chunkId = await assetActor.create_chunk({
        batch_id: parseInt(batchId.batch_id), 
        content: chunk
      });
      chunkIds.push(
        parseInt(chunkId.chunk_id)
      );
    }
    await assetActor.commit_batch({
      batch_id: parseInt(batchId.batch_id),
      operations: [{
        CreateAsset: {
          key: file.name,
          content_type: "image/jpeg",
        }
      },{
        SetAssetContent: {
          key: file.name,
          sha256: [],
          chunk_ids: chunkIds,
          content_encoding: "identity",
        }
      }]
    });
  };

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PlugConnect
            whitelist={whitelist}
            onConnectCallback={() => console.log("Connected joe")}
            host= {host}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            component="label"
            style={{ backgroundColor: "#2d2d2d" }}
          >
            Upload File
            <input
              type="file"
              hidden
              accept="image/jpeg"
              onChange={(e)=>{handleChange(e)}}
            />
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField 
                value={fileName}
                onChange={(e)=>{setFileName(e.target.value)}}
              />
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                component="label"
                onClick={(e)=>{handleShow(e)}}
                style={{ backgroundColor: "#2d2d2d" }}
              >
                Show asset
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <img
            src={image}
          />
        </Grid>
      </Grid>
    </div>
  );
};

ReactDOM.render(<Uploader />, document.querySelector('#app'));