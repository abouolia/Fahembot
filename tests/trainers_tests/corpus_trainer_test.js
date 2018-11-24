'use strict';
process.env.NODE_ENV = 'test';

const {initDB, destroyDB} = require('../utils');
const chai = require('chai');
const assert = chai.assert;
const Fahem = require('../../fahem/fahem');
const CorpusTrainer = require('../../fahem/trainers/corpus_trainer');

describe('corpus_trainer', () => {

    describe('train', () => {
        
    });
});