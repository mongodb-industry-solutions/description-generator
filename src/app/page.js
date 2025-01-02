'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { useS3Upload } from "next-s3-upload";
import Spinner from 'react-bootstrap/Spinner';

import styles from './page.module.css'
import ImageUpload from "@/components/imageUpload/ImageUpload";
import DescriptionInput from "@/components/descriptionInput/DescriptionInput";
import { fetchDescriptions, fetchProducts, updateDescriptionsToMongoDB } from '@/lib/api';
import { setInitialLoad, setProducts, updateProductDescriptions } from '@/redux/slices/ProductsSlice';
import TextInput from '@leafygreen-ui/text-input';
import { getProductImageFromObjectId } from '@/lib/helpers';

const models = [
  {
    value: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
    label: "Llama 3.2 11B",
    isSelected: true
  },
  {
    value: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
    label: "Llama 3.2 90B",
    isSelected: false
  },
];
const languages = [
  { value: "en", label: "English", isSelected: true },
  { value: "es", label: "Spanish", isSelected: false },
  { value: "fr", label: "French", isSelected: false },
  { value: "de", label: "German", isSelected: false },
  { value: "it", label: "Italian", isSelected: false },
  { value: "ja", label: "Japanese", isSelected: false },
  { value: "ko", label: "Korean", isSelected: false },
  { value: "zh", label: "Chinese", isSelected: false },
  { value: "pt", label: "Portuguese", isSelected: false },
];
const lengths = [
  { value: "short", label: "Short", isSelected: true },
  { value: "medium", label: "Medium", isSelected: false },
  { value: "long", label: "Long", isSelected: false },
];

export default function Home() {
  const dispatch = useDispatch();
  const initialLoad = useSelector(state => state.Products.initialLoad)
  const catalogLength = useSelector(state => state.Products.products?.length)
  const productIdRef = useRef(null)

  const [modelOptions, setModelOptions] = useState(models)
  const [model, setModel] = useState(models[0].value);
  const [languageOptions, setLanguageOptions] = useState(languages)
  const [language, setLanguage] = useState([languages[0].value]);
  const [lengthOptions, setLengthOptions] = useState(lengths)
  const [length, setLength] = useState(lengths[0].value);
  const [image, setImage] = useState(null);
  const [sampleImageLoading, setSampleImageLoading] = useState(false)
  const [generatingDescription, setGeneratingDescription] = useState(false)
  const [descriptions, setDescriptions] = useState(null)
  const { uploadToS3 } = useS3Upload();

  const onModelChange = (selectedOption) => {
    setModel(selectedOption.value)
    setModelOptions(prevState =>
      prevState.map(option => {
        return { ...option, isSelected: option.value === selectedOption.value }
      }
      ))
  }
  const onLanguageChange = (selectedOption) => {
    if (language.includes(selectedOption.value)) {
      //remove language from selection
      const filteredLanguages = language.filter(l => l !== selectedOption.value);
      setLanguage(filteredLanguages);
      setLanguageOptions(prevState =>
        prevState.map(option => {
          return option.value === selectedOption.value
            ? { ...option, isSelected: false }
            : { ...option }
        }
        ))
      return;
    }
    // add language to selection
    setLanguage([...language, selectedOption.value]);
    setLanguageOptions(prevState =>
      prevState.map(option => {
        return option.value === selectedOption.value
          ? { ...option, isSelected: true }
          : { ...option }
      }
      ))
  }
  const onLengthChange = (selectedOption) => {
    setLength(selectedOption.value)
    setLengthOptions(prevState =>
      prevState.map(option => {
        console.log(option)
        console.log(selectedOption)
        return { ...option, isSelected: option.value === selectedOption.value }
      }
      ))
  }
  const onGenerateClick = async () => {
    console.log(model, language, length, image)
    const body = {
      languages: language,
      imageUrl: image,
      model,
      length
    }
    if ((language.length < 1 || language.length > 3) || !image)
      return;
    setGeneratingDescription(true);
    const response = await fetchDescriptions(body)
    if (response) {
      setGeneratingDescription(false);
      setDescriptions(response.descriptions);
      // TODO set alert of "Storing description of product ${product._id} in MongoDB"
      const updateMDB = await updateDescriptionsToMongoDB(response)
      if (updateMDB.modifiedCount === 1) {
        dispatch(updateProductDescriptions({ ...body, descriptions: response.descriptions }))
        // TODO set alert of "Description of product ${product._id} stored in MongoDB"
      }else{
        // TODO set alert of "Error storing description of product ${product._id} in MongoDB"

      }
    }
    setGeneratingDescription(false);
  }
  const onLoadImageFromObjectId = () => {
    const imageId = getProductImageFromObjectId(productIdRef.current.value)
    console.log(imageId)
    setImage(imageId)
  }
  const onLoadSampleImage = () => {
    // TODO. replace this hard coded URL with an API call that:
    // 1. retrieves a random document from the product collection
    // 2. use its image URL to setImage
    // TODO. use sampleImageLoading variable to handle loading state while the api is retrieving the sample image
    // when sampleImageLoading  is true the button "Use sample image from catalog" should be disabled and have opacity
    // when sampleImageLoading  is true the ImageUpload component should show a Loading spinner
    setImage("https://m.media-amazon.com/images/I/81seiXB5drL.jpg")
  }

  useEffect(() => {
    if (initialLoad == true || catalogLength > 0)
      return
    const getAllCatalogProducts = async () => {
      dispatch(setInitialLoad(true))
      try {
        const response = await fetchProducts();
        console.log(response.length)
        if (response)
          dispatch(setProducts(response))
        dispatch(setInitialLoad(false))
      } catch (error) {
        dispatch(setInitialLoad(false))
        console.error("There was a problem with your fetch operation:", error);
      }
    };
    getAllCatalogProducts();
  }, [])


  return (
    <div className=''>
      <h2 className="mt-3 mb-3 text-center text-2xl font-bold">Descriptor Generator</h2>
      <div className="container">
        <div className="row ">
          <div className={`${styles.leftSide} col-12 col-md-6 p-3 mb-3 text-center`}>
            <p className='text-secondary'>Upload an image to generate descriptions in multiple languages.</p>
            <div className={`${styles.cursorPointer} d-flex align-items-end mb-3`}>
              <TextInput
                label="Use product from catalog"
                placeholder="Enter ObjectId"
                onChange={event => { console.log(event) }}
                ref={productIdRef}
              />
              <Button
                className={`${styles.submitBtn} ms-2`}
                style={{height: '36px'}}
                onClick={() => onLoadImageFromObjectId()}
              >
                Upload
              </Button>
            </div>
            <ImageUpload image={image} setImage={setImage} uploadToS3={uploadToS3} />

            <div className={`d-flex flex-row-reverse mb-3`}>
              <small onClick={() => onLoadSampleImage()}  className={`${styles.cursorPointer} ${styles.sampleText} mt-1`}>Use sample image from catalog</small>
            </div>

            <DescriptionInput
              title="Model"
              description="Select the Llama 3.2 vision model you want to use."
              options={modelOptions}
              onSelectionChange={onModelChange}
            />
            <hr />
            <DescriptionInput
              title="Languages"
              description="Choose up to 3 languages for the product descriptions."
              options={languageOptions}
              onSelectionChange={onLanguageChange}
              disableUnselectedOptions={language.length >= 3}
            />
            <hr />
            <DescriptionInput
              title="Length"
              description="Select the length of the product descriptions."
              options={lengthOptions}
              onSelectionChange={onLengthChange}
            />
            <div className="d-flex flex-row-reverse mb-3 mt-3">
              <Button
                className={`mt-3 ${styles.submitBtn}`}
                disabled={language.length === 0 || image === null || generatingDescription}
                onClick={() => onGenerateClick()}
              >
                {
                  generatingDescription
                    ? <div>
                      <Spinner className='me-2' animation="border" size='sm' variant="secondary" />
                      Generate Descriptions
                    </div>
                    : 'Generate Descriptions'
                }
              </Button>
            </div>
          </div>
          <div className={`${styles.rightSide} col-12 col-md-6 mb-3 ps-3 pe-3 text-center`}>
            {
              generatingDescription === true
                ? <div className={`${styles.rightSideContainer} d-flex flex-column justify-content-center align-items-center`}>
                  <Spinner animation="border" variant="secondary" />
                  <p>Loading Descriptions ...</p>
                </div>
                :
                descriptions == null
                  ? <div className={`${styles.rightSideContainer} d-flex justify-content-center align-items-center`}>
                    <h5 className='text-secondary pt-3 pb-3 mt-3 mb-3'>See your generated descriptions here</h5>
                  </div>
                  : <div className=''>
                    <h4>Generated descriptions</h4>
                    {
                      descriptions.map((description, index) => (
                        <div key={index}>
                          <h5 className='text-start'>{languages.find(l => l.value === description.language).label}</h5>
                          <p className='text-secondary text-start' style={{ fontSize: '15px' }}>{description.description}</p>
                        </div>
                      ))
                    }
                  </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
