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
    'class': 'Meme',
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

// Creating the '' class in weaviate with the predefined schema
await client.schema
    .classCreator()
    .withClass(schemaConfig)
    .do();

// Converting to base 64
const img = readFileSync('./img/terminal.jpg');
const b64 = Buffer.from(img).toString('base64');

await client.data.creator()
  .withClassName('Meme')
  .withProperties({
    image: b64,
    text: 'matrix meme'
  })
  .do();

//Generating Result
const test = Buffer.from( readFileSync('./test.jpg') ).toString('base64');

const resImage = await client.graphql.get()
  .withClassName('Meme')
  .withFields(['image'])
  .withNearImage({ image: test })
  .withLimit(1)
  .do();

// Write result to filesystem
const result = resImage.data.Get.Meme[0].image;
writeFileSync('./result.jpg', result, 'base64');
