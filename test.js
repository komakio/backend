const mongodb = require('mongodb');
const axios = require('axios');

const run = async () => {
    const m = await mongodb.connect(process.env.KOMAK_MONGODB)
    const profiles = await m.db('default').collection('profiles').find({}).toArray();

    for (let i =0;i<profiles.length;i = i + 10) {
        let indexes = [];
        for(j = i; j < i + 10; j++) {
            indexes.push(j);
        }

        await Promise.all(indexes.map(async (i) => {
            if (!profiles[i]) {
                return;
            }
            const c = profiles[i].address.location.coordinates;
            try {
                const {data} = await axios.get(`https://pelias.ocean.io/v1/reverse?point.lat=${c[1]}&point.lon=${c[0]}`)
                const point = data.features[0].properties;

                console.log(point.country, point.region)
            } catch {
                console.log('error');
            }
        }))
    }

    m.close();
}

run()