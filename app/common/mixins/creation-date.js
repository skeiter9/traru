module.exports = (Model) => {

  Model.defineProperty('creationDate', {
    type: Date,
    default: '$now',
    required: true
  });

};
