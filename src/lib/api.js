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
  return descriptions;
}

export async function updateDescriptionsToMongoDB(props) {
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
  const data = await response.json();
  console.log('data', data)
  
  return data;
}