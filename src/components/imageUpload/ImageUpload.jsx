import React, {useRef} from 'react'
import Image from 'next/image';
import IconButton from '@leafygreen-ui/icon-button';
import XIcon from '@leafygreen-ui/icon/dist/X';
import UploadIcon from '@leafygreen-ui/icon/dist/Upload';

import styles from "./imageUpload.module.css";

const ImageUpload = (props) => {
  let { image, setImage, uploadToS3 } = props;
  const imageInputRef = useRef(null)

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const { url } = await uploadToS3(file);
    setImage(url);
  };

  return (
    <div className={styles.imageUpload}>
      {
        image
          ? <div className={`${styles.imageUploadChildContainer} d-flex flex-column align-items-center`}>
            <div className='w-100 d-flex flex-row-reverse'>
              <IconButton className='me-3 mt-2' onClick={() => setImage(null)} aria-label="Close">
                <XIcon />
              </IconButton>
            </div>
            <Image
              src={image}
              width={120}
              height={120}
              style={{ objectFit: "contain", padding: '4px', marginTop: '-20px' }}
              alt='Product'
            ></Image>
          </div>
          : <div onClick={() => imageInputRef.current.click()} className={`${styles.imageUploadChildContainer} ${styles.cursorPointer} d-flex flex-column align-items-center justify-content-center`}>
            <UploadIcon size="xlarge" />
            <p className='mt-2'>Upload product image</p>
            <input
              ref={imageInputRef}
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="d-none"
            />
          </div>
      }
    </div>
  )
}

export default ImageUpload