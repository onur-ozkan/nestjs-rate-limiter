const loadtest = require('loadtest');
const options = {
    url: 'http://localhost:3333/api',
    maxRequests: 4,
    maxSeconds: 3,
    timeout: 300
};

const runTest = async ( options: any ) => {
    console.log( 'Calling run test');
    return new Promise( (resolve, reject) => {
        loadtest.loadTest(options, (error: any, result: unknown) => {
            console.log( 'Received Response')
            if (error){
                return reject(`Got an error: ${error}`);
            } else {
                console.log('Tests run successfully');
                return resolve(result);
            }
        });
    });
};


const execute = async () => {
    try{
        const resp = await runTest(options);
        console.log( 'resp', resp);
    }catch(err){
        console.log( 'Err', err);
    }
}

execute();

