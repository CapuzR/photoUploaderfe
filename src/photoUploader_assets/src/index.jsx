import { photoUploader } from "../../declarations/photoUploader";
import * as React from 'react'
import ReactDOM from 'react-dom';
import { Button, Grid } from '@mui/material';
import { useState, useEffect } from "react";
import { readAndCompressImage } from 'browser-image-resizer';
import { encode, decode } from 'uint8-to-base64';

// Interact with foo actor, calling the greet method
// const greeting = await photoUploader.greet(name);


export const convertToBase64 = (blob) => {
  return new Promise((resolve) => {
    var reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

export default function Uploader() {
  const [image, setImage] = useState("https://via.placeholder.com/300.png/09f/fff");

  useEffect(async () => {
    const lol = await photoUploader.staticStreamingCallback({ key: "0", index: 0, content_encoding: "" });
    console.log(lol);
    const encoded = encode(lol.body);
    console.log("encoded", "data:image/jpeg;base64,".concat(encoded));
    // console.log(await convertToBase64(lol.body));
    setImage("data:image/jpeg;base64," + encoded);
  }, []);

  const handleChange = async (e) => {
    const file = e.target.files[0];

    const config = {
      quality: 1,
      maxWidth: 200,
      maxHeight: 200,
      autoRotate: true,
      debug: true
    };
    let resizedImage = await readAndCompressImage(file, config);

    const resizedString = await convertToBase64(file);
    console.log(resizedString);

    const data = [...new Uint8Array(await file.arrayBuffer())];
    setImage(resizedString);
    console.log(resizedString);

    const co = {
      Put: {
        key: "0",
        contentType: "image/jpeg",
        payload: {
          Payload: data
        },
        callback: []
      }
    };
    console.log(photoUploader);
    console.log(await photoUploader.assetRequest(co));

  };

  return (
    <div>
      <Grid container>
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
              onChange={handleChange}
            />
          </Button>
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