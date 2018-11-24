
const BayesClassifier = require('./fahem/classification/naive_bayes');
const Levenshtein = require('./fahem/comparison/levenshtein');



let leveshtein = new Levenshtein('would you go to Ahmed?', 'would you please go to Ahmed?');


console.log(leveshtein.distance());
console.log( leveshtein.ratio() );


// let classifier = new BayesClassifier();

// classifier.addDocument('Amazing', 'positive');
// classifier.addDocument('Amazing', 'positive');
// classifier.addDocument('Awesome', 'positive');
// classifier.addDocument('Incredible', 'positive');
// classifier.addDocument('Fun', 'positive');
// classifier.addDocument('Fun', 'positive');

// classifier.addDocument('Bad', 'negative');
// classifier.addDocument('Unfortunately', 'negative');
// classifier.addDocument('Terrible', 'negative');

// classifier.train();

// let a = classifier.getClassifications('Awesome');

// console.log(a);