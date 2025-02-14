import React, {useRef, useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';
import IconButton from '@leafygreen-ui/icon-button';
import XIcon from '@leafygreen-ui/icon/dist/X';
import UploadIcon from '@leafygreen-ui/icon/dist/Upload';
import FileIcon from '@leafygreen-ui/icon/dist/File';

import styles from "./imageUpload.module.css";
import { setImage } from '@/redux/slices/FormSlice';

const ImageUpload = (props) => {
  const dispatch = useDispatch();
  let { uploadToS3 } = props;
  const imageInputRef = useRef(null)
  const image = useSelector(state => state.Form.image)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = async (event) => {
    setLoading(true)
    const file = event.target.files?.[0];
    if (!file) return;
    const { url } = await uploadToS3(file);
    console.log('uploadToS3', url)
    dispatch(setImage(url))
    setLoading(false)
  };

  useEffect(() => {
    console.log(image)
  }, [image])
  

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
          : loading
          ?  <div className={`${styles.imageUploadChildContainer} d-flex flex-column align-items-center justify-content-center`}>
            <strong className='text-secondary'>Loading...</strong>
          </div>
          : <div 
            onClick={() => imageInputRef.current.click()} 
            className={`${styles.imageUploadChildContainer} ${styles.cursorPointer} d-flex flex-column align-items-center justify-content-center`}
          >
            <UploadIcon size="xlarge" className='' />
            <FileIcon size="xlarge" className='d-none' />
            <p className='mt-2'>Upload product image</p>
            <p className='mt-2 d-none'>Product image</p>
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