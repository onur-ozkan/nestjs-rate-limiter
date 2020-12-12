// tslint:disable-next-line: no-var-requires
const loadtest = require('loadtest');
const options = {
    url: 'http://localhost:3333/api',
    maxRequests: 4,
    maxSeconds: 3,
    timeout: 300
};

// tslint:disable-next-line: no-shadowed-variable
const runTest = async ( options: any ) => {
    return new Promise( (resolve, reject) => {
        loadtest.loadTest(options, (error: any, result: unknown) => {
            if (error){
                return reject(`Got an error: ${error}`);
            } else {
                return resolve(result);
            }
        });
    });
};


const execute = async () => {
    try{
        const resp = await runTest(options);
    // tslint:disable-next-line: no-empty
    }catch(err){}
}

execute();

