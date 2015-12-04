module.exports = function(Person) {

  Person.validatesUniquenessOf('email');

};
