import {Router} from 'express';

const Cityrouter = Router();

// Example user route

Cityrouter.route('/').post((req, res) => {
    // Handle user creation
    res.status(201).send({message: 'User created'});
});


export {Cityrouter};