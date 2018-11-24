

function validateAdapterClass(subclass, adapterClass){
  if( subclass.__proto__.prototype != adapterClass.prototype )
    throw new Error('Subclass is not extended from adapter class.');
  
  return subclass;
}

function validateAdapterInstance(subclassInstance, adapterClass){
  if( false === subclassInstance instanceof adapterClass ) 
    throw new Error('Subclass instance is not extened from adapter class.');

  return subclassInstance;
}

function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const asyncForEach = async (array, callback) => {
  for (let i = 0; i < array.length; i++){
    await callback(array[i], i, array);
  }
};

const asyncForIn = async (object, callback) => {
  let index = 0;
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      await callback(object[key], index, object);
    }
    index++;
  }
};

module.exports = {
  validateAdapterClass,
  validateAdapterInstance,
  getRandomInt,
  asyncForEach,
  asyncForIn
}