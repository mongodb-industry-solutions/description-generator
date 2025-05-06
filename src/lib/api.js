export async function fetchProducts() {
    const response = await fetch("/api/getCatalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {},
    });
    if (!response.ok) {
      throw new Error(`Error fetching cart: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export async function fetchDescriptions(body) {
  const response = await fetch("/api/generateDescriptions", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const descriptions = await response.json();
  console.log(descriptions)

  return descriptions;
}

export async function deleteDescriptions(props) {
  let {_id, imageUrl} = props

  const response = await fetch("/api/deleteDescriptions", {
    method: "POST",
    body: JSON.stringify({
      _id,
      imageUrl
    }),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const descriptions = await response.json();
  return descriptions;
}

export async function updateDescriptionsToMongoDB(props) {
  console.log('updateDescriptionsToMongoDB', props)
  let {descriptions, length, model, imageUrl} = props
  const response = await fetch("/api/updateDescriptions", {
    method: "POST",
    body: JSON.stringify({
      descriptions,
      model,
      imageUrl,
      length
    }),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const productDocument = await response.json();
  console.log('data updateDescriptionsToMongoDB', productDocument)
  return productDocument;
}

export async function deleteProductFromMDB(props) {
  let {_id, imageUrl} = props

  if(imageUrl.includes('https://m.media-amazon.com/images'))
    console.log('Remove image from s3 bucket')

  const response = await fetch("/api/deleteProduct", {
    method: "POST",
    body: JSON.stringify({
      _id,
      imageUrl
    }),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const descriptions = await response.json();
  return descriptions;
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  let res = await fetch("/api/s3-upload", {
    method: "POST",
    body: formData,
  });

  res = await res.json();

  console.log("File uploaded to:", res);
  return {url: res.url}
}
