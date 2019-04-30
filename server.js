/* eslint-disable indent */
'use strict';

require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const MOVIES = require('./movies-data-small.json');

let genres = MOVIES.reduce((acc, curr) => { 
    return acc.includes(curr.genre.toLowerCase()) ? acc : [...acc,curr.genre.toLowerCase()];
},[]);

let countries = MOVIES.reduce((acc, curr) => { 
    return acc.includes(curr.country.toLowerCase()) ? acc : [...acc,curr.country.toLowerCase()];
},[]);
    
console.log(countries)

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(helmet());

app.use(function validateBearerToken(req, res, next) {
    const bearerToken = req.get('Authorization').split(' ')[1];
    const apiToken = process.env.API_KEY;
    const authToken = req.get('Authorization');
        

    if (bearerToken !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
    }
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
    }
    next();
});

console.log(process.env.API_KEY);

app.get('/movie', (request, response) => {
    const query = request.query;
    const genre = query.genre;
    const country = query.country;
    const avg_vote = query.rating;
    

    let output= MOVIES;

    if(genre){
        
        const valid = genres;
        if(!valid.includes(genre)){
            response.status(404).send('error not a genre');
        }

        output = output.filter(item => item.genre.toLowerCase().includes(genre.toLowerCase()));
    }

    if(country){
        const valid = countries;
        if(!valid.includes(country)){
            response.status(404).send('error not a country');
        }
        output = output.filter(item => item.country.toLowerCase().includes(country.toLowerCase()));
    }

    if(avg_vote){
        output = output.filter(item => item.avg_vote >= avg_vote);
    }

    if(output.length === 0 ){
        response.status(404).json('no entries found');
    }
    response.status(200).json(output);
});



const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});


