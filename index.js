import weaviate from 'weaviate-ts-client';
import { readFileSync, readdirSync, writeFileSync } from 'fs';


const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
});

// Delete all classes (schemas)
// Uncomment to delete current classes
//await client.schema.deleteAll();

const schemaRes = await client.schema.getter().do();

console.log(schemaRes)

const schemaConfig = {
    'class': 'MemeImage',
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

await client.schema
    .classCreator()
    .withClass(schemaConfig)
    .do();

// Converting to base 64
const img = readFileSync('./img/programming_bell_curve.jpg');

const b64 = Buffer.from(img).toString('base64');

await client.data.creator()
  .withClassName('MemeImage')
  .withProperties({
    image: b64,
    text: 'matrix meme'
  })
  .do();

//Generating Result
const test = Buffer.from( readFileSync('./test.jpg') ).toString('base64');

const resImage = await client.graphql.get()
  .withClassName('MemeImage')
  .withFields(['image'])
  .withNearImage({ image: test })
  .withLimit(1)
  .do();

// Write result to filesystem
const result = resImage.data.Get.MemeImage[0].image;
writeFileSync('./result.jpg', result, 'base64');