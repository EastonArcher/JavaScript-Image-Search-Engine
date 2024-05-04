// Importing necessary libraries and weaviate  
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import weaviate from 'weaviate-ts-client';

// Setting up Weaviate client
const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
});

// Fetch current schema from Weaviate and then logging it
const schemaRes = await client.schema.getter().do();
console.log(schemaRes)

// Delete all existing classes (schemas) 
await client.schema.deleteAll();

// Configuring schema for a new class with image and text properties
const schemaConfig = {
    'class': 'Image',
    'vectorizer': 'img2vec-neural',
    'vectorIndexType': 'hnsw',
    'moduleConfig': {
        'img2vec-neural': {
            'imageFields': [
                'image'
            ]
        }
    },
    'properties': [
        {
            'name': 'image',
            'dataType': ['blob']
        },
        {
            'name': 'text',
            'dataType': ['string']
        }
    ]
}
 
// Creating the 'Image' class in weaviate with the predefined schema
await client.schema
    .classCreator()
    .withClass(schemaConfig)
    .do();

// 
// const imgFiles = readdirSync('./img');
// const promises = imgFiles.map(async (imgfile) => {
//     const b64 = toBase64('./img/${imgFile}');

//     await client.data.creator()
//     .withClassName('Image')
//     .withProperties({
//         image: b64,
//         text: imgFile.split('.')[0].split('_').join(' ')
//     })
//     .do();
// })

// Converting the image to base 64 format
const img = readFileSync('./img/terminal.jpg');
const b64 = Buffer.from(img).toString('base64');

// Creating a new data object
await client.data.creator()
  .withClassName('Image')
  .withProperties({
    image: b64,
    text: 'matrix img'
  })
  .do();

// Converting test image file to base64 fomat
const test = Buffer.from( readFileSync('./test.jpg') ).toString('base64');

// Querying Weaviate to find similar images based on the test image
const resImage = await client.graphql.get()
  .withClassName('Image')
  .withFields(['image'])
  .withNearImage({ image: test })
  .withLimit(1)
  .do();

// Extract the result image and write it to the filesystem
const result = resImage.data.Get.Image[0].image;
writeFileSync('./result.jpg', result, 'base64');

