import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Cropper from 'react-cropper';
import CommonDialog from '../pages/Propose/CommonDialog';

let cropper = React.createRef(null);

export default function ImageCrop(props) {
  const [originFile, setOriginFile] = useState([]);
  const [cropFile, setCropFile] = useState('');
  const [imgPreviewUrl, setImgPreviewUrl] = useState('');
  const { close, accept } = props;

  const acceptCrop = React.useCallback(() => {
    const cropData = {
      cropFile,
      imgPreviewUrl,
    };
    accept(cropData);
  }, [cropFile, imgPreviewUrl]);

  // console.log('originFile', originFile);

  function handleImageChange(event) {
    event.preventDefault();
    const reader = new FileReader();
    const orFiles = event.target.files;
    const file = orFiles[0];
    if (file && orFiles) {
      setOriginFile(orFiles);
      reader.onloadend = e => {
        // setOriginFile(files);
        setImgPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function crop() {
    // image in dataUr
    const dataUrl = cropper.getCroppedCanvas().toDataURL();
    // const dataUrl = cropper.getCroppedCanvas();
    const newName = originFile[0].name;
    const newType = originFile[0].type;
    const list = new DataTransfer();
    try {
      await fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const parseFile = new File([blob], newName, { type: newType });
          list.items.add(parseFile);
        });
      setCropFile(list.files);
    } catch (err) {
      console.log(err);
    }
  }

  //   let $imagePreview = null;
  //   if (imgPreviewUrl) {
  //     $imagePreview = <img src={imgPreviewUrl} alt="imgPreview" />;
  //   } else {
  //     $imagePreview = <div className="previewText">Your avatar</div>;
  //   }

  return (
    <CommonDialog
      title="Create Avatar"
      okText="Accept"
      cancelText="Cancel"
      close={close}
      cancel={close}
      confirm={acceptCrop}
      isCancel
    >
      <input className="fileInput" type="file" onChange={handleImageChange} accept="image/*" />
      {imgPreviewUrl && (
        <Cropper
          ref={value => {
            cropper = value;
          }}
          src={imgPreviewUrl}
          style={{ height: 400, width: '100%' }}
          // Cropper.js options
          aspectRatio={1}
          guides={false}
          crop={() => {
            crop();
          }}
          viewMode={1}
          autoCrop
          minContainerWidth={200}
          minContainerHeight={200}
          cropBoxResizable={false}
          movable={false}
        />
      )}
    </CommonDialog>
  );
}
