import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
});

const schemaRes = await client.schema.getter().do();

console.log(schemaRes);

const schemaConfig = {
    'class': 'Images',
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
const img = readFileSync('./img/mountain.jpg');
const b64 = Buffer.from(img).toString('base64');

const red = await client.data.creator()
    .withClassName('Images')
    .withProperties({
        image: b64,
        text: 'Matrix Image'
    })
    .do();