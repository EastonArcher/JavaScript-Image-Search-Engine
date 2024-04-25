import weaviate from 'weaviate-ts-client';
import { readFileSync, readdirSync, writeFileSync } from 'fs';


const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
});

const schemaRes = await client.schema.getter().do();

console.log(schemaRes);

const schemaConfig = {
    'class': 'ReturnImg',
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

// Update Schema
await client.schema
    .classCreator()
    .withClass(schemaConfig)
    .do();

// Converting to base 64
// const imgFiles = readdirSync('./img');
// const promises = imgFiles.map(async(imgFile) => {
//     const b64 = toBase64('./img/${imgFile');

//     await client.data.creator()
//         .withClassName('ReturnImg')
//         .withProperties({
//             image: b64,
//             text: imgFile.split('.')[0].split('_').join(' ')
//         })
//         .do();
// })
// await Promise.all(promises);

const img = readFileSync('./img/ross_meme.jpeg');
const b64 = Buffer.from(img).toString('base64');

//Write to weaviate
const res = await client.data.creator()
    .withClassName('ReturnImg')
    .withProperties({
        image: b64,
        text: 'matrix result'
    })
    .do();


//Generating Result
const test = Buffer.from(readFileSync('./test.jpg')).toString('base64');

const resImage = await client.graphql.get()
    .withClassName('ReturnImg')
    .withFields(['image'])
    .withNearImage({image: test})
    .withLimit(1)
    .do();

const result = resImage.data.Get.ReturnImg[0].image;
writeFileSync('./result.jpg', result, 'base64');