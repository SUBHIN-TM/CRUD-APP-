const http = require('http');
const fs = require('fs');
const url = require('url');

const server = http.createServer((req, res) => {
    if (req.url === '/') { //CHECK URL IS ROOT

        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Error loading the HTML file.');
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.write(data)
                res.end()
            }
        })
    }

    else if (req.method === 'GET' && req.url === '/userData') {
        //i need to import here that json file then i can send to front end
        fs.readFile('data.json', (err, userData) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Error loading the HTML file.');
            } else {
                res.writeHead(200, { 'content-Type': 'application/json' })
                res.write(userData);
                res.end();
            }
        })

    }



    else if (req.method == 'POST' && req.url === '/submit') {
        let body = ''; //JUST CREATED A VARIABLE EMPTY STRING
        req.on('data', (data) => { //LISTEN FOR DATA CHUNKS IN BODY
            body += data; // BODY COPIED TO THIS BODY STRING
        })
        req.on('end', () => { //NOW FULLY REXCIEVED THE BODY AND AFTER WHAT TO DO SECTION
            //WE USE TRY ,CATCH METHORD BCZ ITS SYNCRONOUS (IF ASYNC WE CAN USE THEN)
            try {
                const recievedData = JSON.parse(body) //PARSE THE RECIVED JSON STRING TO = JS OBJECT
                console.log(recievedData);//JUST LOG THE DATA

                //READ THE EXISTING DATA FROM JSON FILE
                fs.readFile('data.json', (err, eData) => {
                    if (err) {
                        console.error('Error processing data', err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' })
                        res.end('error processing EXISTINGDATA')

                    } else {
                        let existingData = []
                        existingData = JSON.parse(eData) //NOW IT HAVE  PREVIOS JSON DATAS
                        const newId = existingData.length + 1;
                        recievedData.id = newId
                        existingData.push(recievedData) //PUSHED NEW USER FILE TO SAME ARRAY as object

                        //WRITE THIS UPDATED ARRAY TO DATABASE JSON FILE
                        fs.writeFile('data.json', JSON.stringify(existingData, null, 2), (writeError) => {
                            if (writeError) {
                                console.error('Error processing data', writeError);
                                res.writeHead(500, { 'Content-Type': 'text/plain' })
                                res.end('error while writing updated data to json file')

                            } else {
                                console.log("data updated to json file successfully");
                                // response.writeHead(301, {
                                //     Location: `/`
                                //   }).end();
                                res.writeHead(200, { 'Content-Type': 'text/plain' })
                                res.end("data recieved and saved")
                            }
                        })

                    }
                })

                // //TAKE IT AS SYNCRNS FUNCTION,SO IT BLOCK OTHER EXCUTION,ONLY WRK AFTER GETING THIS PROCESS
                // //IF WE USE ASYN THEN IT DOES NOT BLOCK ,U SHUOLD WRITE CB AND IT WILL WORK
                // //HERE WE MAKE SURE THAT BALACE PROCESS WORK AFTER THIS DONE
                // fs.appendFileSync('data.json',JSON.stringify(recievedData) + '\n') //AGAIN OBJECT IS COVERTTED TO JSON STRING TO STORE
                // console.log("suuccesfully stored to data json");
                // res.writeHead(200,{'Content-Type' : 'text/plain'})
                // res.end("data recieved and saved")
            }
            catch (error) {
                console.error('Error processing data', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                res.end('error processing DATA')
            }

        })

    }

    else if (req.url == "/tableView") {
        fs.readFile('table.html', (err, tableData) => {
            if (err) {
                console.error('Error processing data', err);
                res.writeHead(500, { 'Content-Type': 'text/html' })
                res.end("error")

            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(tableData)
                res.end();
            }
        })
    }


    //REQUEST TO DELETE THE USER FROM OBJECT
    else if (req.method === 'DELETE' && req.url.startsWith('/deleteUser')) {
        const parsedUrl = url.parse(req.url, true); //PARSE THE URL AND returns withobject
        const userId = parseInt(parsedUrl.pathname.split('/').pop(), 10);//EXTRACT USER ID
        console.log("user id to delete", userId);
        const users = require('./data.json'); //METHORD 1
        const upDatedUsers = users.filter(userFind => userFind.id !== userId)//NOW FILTERED THE ALL OBEJCT IN THIS VARIABLE,EXCEPT THIS ID(RECIEVED) CONTAINS
       
        for(var i=0;i<upDatedUsers.length;i++){
                upDatedUsers[i].id=i+1
              }

        const upDatedUsersJSON = JSON.stringify(upDatedUsers, null, 2); //CONVERTED TO JSON FORMAT
        //2 NUMBER OF SPACES,NULL MEANS NOT ALTERING DURUING CONVERTION
        //NOW upDatedUsersJSON CONTAIN DATA TO REPLEC IN DATABASE


        fs.writeFile('data.json', upDatedUsersJSON, (error) => { //READ THE DATA BASE AND OVER WRITED NEW DATABASE
            if (error) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end("error");
            } else {
                console.log("deleted the user details");
                res.end()
            }
        })
    }




    //REQUEST TO MODIFY THE DATA BASE
    else if (req.method === 'PUT' && req.url.startsWith('/modifyUser')) {
        const parsedUrl = url.parse(req.url, true); //PARSE THE URL AND returns withobject
        const userId = parseInt(parsedUrl.pathname.split('/').pop(), 10);//ITS TAKE THE GIVEN USER ID FRIOM THIS AND MAKE IT AN INTEGER WITH HELP OF BASE 10

        // READING THE SENTED NEW TYPED DATA 
        let body = '';
        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => {
            try {
                const updatedUserData = JSON.parse(body);//PARSED THE CONTENT AND SAVED IN  VARIABLE

                // READ THE EXISTING DATA
                fs.readFile('data.json', (err, userData) => {
                    if (err) {
                        console.error('Error reading user data', err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error reading user data.');
                    } else {
                        let existingData = JSON.parse(userData);//OLD DATA STORED
                        //NEED TO FIND THE COMING ID BELONGS TO WHICH OBJECT

                        // SEARCHING FOR THAT OBJECT 
                        for (let i = 0; i < existingData.length; i++) { //THIS I ITERATE THROUGH EACH OBJECT AND FINFD THE OBJECT CONTAIN PROPEERTY ID
                            if (existingData[i].id === userId) {
                                existingData[i] = updatedUserData;//FINDED THE WHOLE OBJECT AND REPLACED OR OVER WRITED BY THE NEW DATA IN THAT VARIABLE
                                break;
                            }
                        }

                        // NOW THE EXISTING DATA HAS UPDATED SO NEED TO WRITE IN DATA BASE 
                        fs.writeFile('data.json', JSON.stringify(existingData, null, 2), (writeError) => {
                            if (writeError) {
                                console.error('Error writing updated data', writeError);
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('Error writing updated data to JSON file.');
                            } else {
                                console.log('User data updated successfully.');
                                res.writeHead(200, { 'Content-Type': 'text/plain' });
                                res.end('User data updated successfully.');
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('Error processing data', error);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Error processing data.');
            }
        });
    }


    else { //IF THE REQUEST URL NOT MACTCH OR ANY PROBLEM
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('not found')
    }
})






server.listen(3000, () => {
    console.log("server is running on port 3000");
})


